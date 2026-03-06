import { createAuthClient } from "better-auth/react";

// Use the current origin (works for both local and production)
// The auth client will call /api/auth/* routes which are proxied to the backend
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : import.meta.env.PUBLIC_FRONTEND_URL,
});
export const { useSession, signIn, signOut } = authClient;

export type AuthSession = typeof authClient.$Infer.Session;
