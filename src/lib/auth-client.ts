import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.PUBLIC_FRONTEND_URL,
});
export const { useSession, signIn, signOut } = authClient;

export type AuthSession = typeof authClient.$Infer.Session;
