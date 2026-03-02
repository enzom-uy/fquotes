import { authClient } from "@/lib/auth-client";
export function GoogleSignInButton() {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${import.meta.env.PUBLIC_FRONTEND_URL}/profile`,
      newUserCallbackURL: `${import.meta.env.PUBLIC_FRONTEND_URL}/create-profile`,
    });
  };
  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg"
    >
      Sign in with Google
    </button>
  );
}
