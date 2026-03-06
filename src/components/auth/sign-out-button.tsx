import { useState } from "react";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getLocalizedPath, type Locale } from "@/i18n";

interface SignOutButtonProps {
  locale?: Locale;
}

export const SignOutButton = ({ locale = "en" }: SignOutButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = getLocalizedPath('/', locale);
          },
        },
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <LogOut size={18} />
      {isLoading ? "Signing out..." : "Sign Out"}
    </button>
  );
};
