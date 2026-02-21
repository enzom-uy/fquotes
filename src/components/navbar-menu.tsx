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

interface NavbarMenuProps {
  currentPath: string;
  userName?: string;
  userImage?: string | null;
}

export const NavbarMenu = ({
  currentPath,
  userName,
  userImage,
}: NavbarMenuProps) => {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/";
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  const navItems = [
    { href: "/", label: "Capture", icon: Camera },
    { href: "/quotes", label: "My Quotes", icon: BookMarked },
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
            href="/profile"
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
            {userName || "Profile"}
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-danger focus:text-danger cursor-pointer"
        >
          <LogOut size={16} className="mr-2" />
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
