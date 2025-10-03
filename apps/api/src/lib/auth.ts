import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@vefy/db";
import { sendVerificationEmail, sendResetPasswordEmail } from "./email";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3001";

const EMAIL_LINK_EXPIRES_IN = 30 * 60;

// Mail goes out through a free Gmail account — cap resends per IP to protect its quota
const EMAIL_RATE_LIMIT = { window: 60 * 60, max: 3 };

export const auth = betterAuth({
  baseURL: BASE_URL,
  database: drizzleAdapter(db, { provider: "pg" }),
  basePath: "/api/auth",
  trustedOrigins: [FRONTEND_URL],

  user: {
    deleteUser: { enabled: true },
    additionalFields: {
      profileCompleted: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: EMAIL_LINK_EXPIRES_IN,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: EMAIL_LINK_EXPIRES_IN,
    sendVerificationEmail: async ({ user, url }) => {
      // Replace default callbackURL with frontend complete-profile page
      const verifyUrl = url.replace(
        /callbackURL=[^&]*/,
        `callbackURL=${encodeURIComponent(`${FRONTEND_URL}/auth/complete-profile`)}`,
      );
      await sendVerificationEmail(user.email, verifyUrl);
    },
  },

  rateLimit: {
    enabled: true,
    // Memory storage isn't shared across serverless instances
    storage: "database",
    customRules: {
      "/send-verification-email": EMAIL_RATE_LIMIT,
      "/request-password-reset": EMAIL_RATE_LIMIT,
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
    // cookieCache disabled — base64 avatar makes cookies too large (431 error)
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Google sign-in already has name → mark profile as completed
          // Email sign-up name is auto-generated → remains incomplete
          // Check: if user has image (from OAuth avatar), mark complete
          if (user.image) {
            const { user: userTable } = await import("@vefy/db");
            const { eq } = await import("drizzle-orm");
            await db
              .update(userTable)
              .set({ profileCompleted: true })
              .where(eq(userTable.id, user.id));
          }
        },
      },
    },
  },
});
