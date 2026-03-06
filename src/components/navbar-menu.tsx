import { useState } from "react";
import { Camera, BookMarked, User, LogOut, ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { t, getLocalizedPath, type Locale } from "@/i18n";

interface NavbarMenuProps {
  currentPath: string;
  userName?: string;
  userImage?: string | null;
  locale?: Locale;
}

export const NavbarMenu = ({
  currentPath,
  userName,
  userImage,
  locale = "en",
}: NavbarMenuProps) => {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = getLocalizedPath("/", locale);
          },
        },
      });
    } catch (error) {
      setIsSigningOut(false);
    }
  };

  const navItems = [
    { 
      href: getLocalizedPath("/", locale), 
      label: t(locale, "nav.capture"), 
      icon: Camera 
    },
    { 
      href: getLocalizedPath("/quotes", locale), 
      label: t(locale, "nav.quotes"), 
      icon: BookMarked 
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="md:hidden flex items-center gap-1 rounded-lg hover:bg-background-muted transition-colors p-1"
          aria-label="Open menu"
        >
          {userImage ? (
            <img
              src={userImage}
              alt={userName || "User"}
              className="w-8 h-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-background-muted flex items-center justify-center">
              <User size={18} className="text-foreground-muted" />
            </div>
          )}
          <ChevronDown size={14} className="text-foreground-muted" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <DropdownMenuItem
              key={item.href}
              asChild
              className={isActive ? "bg-primary/10 text-primary" : ""}
            >
              <a href={item.href} className="flex items-center gap-2 cursor-pointer">
                <Icon size={16} />
                {item.label}
              </a>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a
            href={getLocalizedPath("/profile", locale)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {userImage ? (
              <img
                src={userImage}
                alt={userName || "User"}
                className="w-4 h-4 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User size={16} />
            )}
            {userName || t(locale, "nav.profile")}
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-danger focus:text-danger cursor-pointer"
        >
          <LogOut size={16} className="mr-2" />
          {isSigningOut ? t(locale, "quotesManager.signingOut") : t(locale, "common.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
