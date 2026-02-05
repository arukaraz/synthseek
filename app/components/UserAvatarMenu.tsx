"use client";

import { Avatar } from "@components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { motion } from "framer-motion";
import { Check, LogOut, Moon, Sparkles, Sun, User, Waves } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { logoutItem, menuContent, menuItem, triggerButton, userInfoContainer } from "./UserAvatarMenu/styles";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "midnight", label: "Midnight", icon: Sparkles },
  { value: "ocean", label: "Ocean", icon: Waves },
] as const;

export function UserAvatarMenu() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu open={false} onOpenChange={() => {}}>
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

          {/* <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-fg/50" />
          </motion.div> */}
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className={menuContent()}>
        <div className={userInfoContainer()}>
          <Avatar size="lg" className="shrink-0">
            <User className="text-fg/70 h-5 w-5" />
          </Avatar>

          <div className="flex min-w-0 flex-col">
            <span className="text-fg truncate text-sm font-semibold">User</span>
            <span className="text-fg/50 truncate text-xs">user@example.com</span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-fg/10 my-1.5" />

        <div className="px-3 py-2">
          <span className="text-fg/50 text-xs font-medium">Theme</span>
        </div>
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)} className={menuItem()}>
            <div className="flex items-center gap-3">
              <Icon className="text-fg/70 h-4 w-4" />
              <span className="text-sm">{label}</span>
            </div>
            {mounted && theme === value && <Check className="text-primary-500 h-4 w-4" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-fg/10 my-1.5" />

        <DropdownMenuItem disabled className={logoutItem()}>
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
