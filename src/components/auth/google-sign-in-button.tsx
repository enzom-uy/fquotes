import { authClient } from "@/lib/auth-client";
import { t, type Locale, getLocalizedPath } from "@/i18n";

export interface GoogleSignInButtonProps {
  locale?: Locale;
}

export function GoogleSignInButton({ locale = "en" }: GoogleSignInButtonProps) {
  const handleLogin = async () => {
    const baseUrl = import.meta.env.PUBLIC_FRONTEND_URL;
    const profilePath = getLocalizedPath('/profile', locale);
    const createProfilePath = getLocalizedPath('/create-profile', locale);
    
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${baseUrl}${profilePath}`,
      newUserCallbackURL: `${baseUrl}${createProfilePath}`,
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
