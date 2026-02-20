import { useState } from "react";
import { Menu, X, Camera, BookMarked, User, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

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
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-background-muted transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`
          fixed top-[73px] left-0 right-0 bg-background-elevated border-b border-border z-50
          md:hidden transition-all duration-300 ease-in-out
          ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}
        `}
      >
        <nav className="flex flex-col p-4 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground-muted hover:text-foreground hover:bg-background-muted"
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                {item.label}
              </a>
            );
          })}

          {/* Profile Link in Mobile */}
          <a
            href="/profile"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border-t border-border mt-2 pt-4
              ${
                currentPath === "/profile"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground-muted hover:text-foreground hover:bg-background-muted"
              }
            `}
            onClick={() => setIsOpen(false)}
          >
            {userImage ? (
              <img
                src={userImage}
                alt={userName || "User"}
                className="w-5 h-5 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User size={20} />
            )}
            {userName || "Profile"}
          </a>

          {/* Sign Out Button in Mobile */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-danger hover:bg-danger/10 disabled:opacity-50 disabled:cursor-not-allowed w-full text-left"
          >
            <LogOut size={20} />
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </button>
        </nav>
      </div>
    </>
  );
};
