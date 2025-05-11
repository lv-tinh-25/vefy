import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@vefy/db";
import { sendVerificationEmail } from "./email";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3001";

export const auth = betterAuth({
  baseURL: BASE_URL,
  database: drizzleAdapter(db, { provider: "pg" }),
  basePath: "/api/auth",
  trustedOrigins: [FRONTEND_URL],

  user: {
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
    sendResetPassword: async ({ user, url }) => {
      // TODO: implement password reset email
      console.log(`Password reset for ${user.email}: ${url}`);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Replace default callbackURL with frontend complete-profile page
      const verifyUrl = url.replace(
        /callbackURL=[^&]*/,
        `callbackURL=${encodeURIComponent(`${FRONTEND_URL}/auth/complete-profile`)}`,
      );
      await sendVerificationEmail(user.email, verifyUrl);
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
