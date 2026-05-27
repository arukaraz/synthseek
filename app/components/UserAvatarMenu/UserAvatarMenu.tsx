"use client";

import { Avatar } from "@components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { useLogout } from "@hooks/api/mutations/auth/useLogout";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { motion } from "framer-motion";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutItem, menuContent, triggerButton, userInfoContainer } from "./styles";

export function UserAvatarMenu() {
  const { currentUser } = useAuthContext();
  const logout = useLogout();
  const router = useRouter();

  if (!currentUser) return null;

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } finally {
      router.replace("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          className={triggerButton()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="User menu"
        >
          <Avatar size="md">
            <User className="text-fg/70 h-4 w-4" />
          </Avatar>
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className={menuContent()}>
        <div className={userInfoContainer()}>
          <Avatar size="lg" className="shrink-0">
            <User className="text-fg/70 h-5 w-5" />
          </Avatar>

          <div className="flex min-w-0 flex-col">
            <span className="text-fg truncate text-sm font-semibold">{currentUser.username}</span>
            <span className="text-fg/50 truncate text-xs">{currentUser.email}</span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-fg/10 my-1.5" />

        <DropdownMenuItem onClick={handleLogout} disabled={logout.isPending} className={logoutItem()}>
          <LogOut className="h-4 w-4" />
          <span className="text-sm">{logout.isPending ? "Signing out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
