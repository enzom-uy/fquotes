import { authClient } from "@/lib/auth-client";
import { t, type Locale } from "@/i18n";

export interface GoogleSignInButtonProps {
  locale?: Locale;
}

export function GoogleSignInButton({ locale = "en" }: GoogleSignInButtonProps) {
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
      {t(locale, "common.signIn")} Google
    </button>
  );
}
