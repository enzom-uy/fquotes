import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, BookMarked, LogOut, ChevronDown, Settings } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { t, getLocalizedPath, type Locale } from "@/i18n";
import { UserAvatar } from "@/components/ui/user-avatar";

interface UserDropdownProps {
  userName: string;
  userImage?: string | null;
  locale?: Locale;
}

export const UserDropdown = ({ userName, userImage, locale = "en" }: UserDropdownProps) => {
  const handleSignOut = async () => {
    await signOut();
    window.location.href = getLocalizedPath("/", locale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background-muted transition-colors group outline-none">
          <UserAvatar src={userImage} name={userName} size="sm" />
          <span className="text-sm font-medium text-foreground-muted group-hover:text-foreground transition-colors">
            {userName.split(" ")[0]}
          </span>
          <ChevronDown
            size={16}
            className="text-foreground-muted group-hover:text-foreground transition-colors"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-background-elevated/95 backdrop-blur-md border-border z-[60]"
      >
        <DropdownMenuItem asChild>
          <a href={getLocalizedPath("/profile", locale)} className="flex items-center gap-2">
            <User size={16} />
            <span>{t(locale, "nav.profile")}</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={getLocalizedPath("/quotes", locale)} className="flex items-center gap-2">
            <BookMarked size={16} />
            <span>{t(locale, "nav.quotes")}</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={getLocalizedPath("/settings", locale)} className="flex items-center gap-2">
            <Settings size={16} />
            <span>{t(locale, "nav.settings")}</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 text-danger hover:text-danger focus:text-danger"
        >
          <LogOut size={16} />
          <span>{t(locale, "common.signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
