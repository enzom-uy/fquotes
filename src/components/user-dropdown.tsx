import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, BookMarked, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/auth-client";

interface UserDropdownProps {
  userName: string;
  userImage?: string | null;
}

export const UserDropdown = ({ userName, userImage }: UserDropdownProps) => {
  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-background-muted transition-colors group outline-none">
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
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
          <a href="/profile" className="flex items-center gap-2">
            <User size={16} />
            <span>Profile</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/quotes" className="flex items-center gap-2">
            <BookMarked size={16} />
            <span>My Quotes</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 text-danger hover:text-danger focus:text-danger"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
