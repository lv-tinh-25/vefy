import { createAuthClient } from "better-auth/react";

const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  fetchOptions: {
    credentials: "include",
  },
});

export const useSession = client.useSession;
export const signIn = client.signIn;
export const signUp = client.signUp;
export const signOut = client.signOut;
export const changePassword = client.changePassword;
export const deleteUser = client.deleteUser;
export const revokeOtherSessions = client.revokeOtherSessions;
export const requestPasswordReset = client.requestPasswordReset;
export const resetPassword = client.resetPassword;
export const sendVerificationEmail = client.sendVerificationEmail;
