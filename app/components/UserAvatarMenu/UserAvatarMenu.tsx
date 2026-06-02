"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { useLogout } from "@hooks/api/mutations/auth/useLogout";
import { useVersionState } from "@hooks/api/subscriptions";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { isBreakingUpdate } from "@utils/version";
import { motion } from "framer-motion";
import { Loader2, LogOut, Settings as SettingsIcon, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { MenuHeaderBlock } from "./components/MenuHeaderBlock";
import { MenuUpdateSection } from "./components/MenuUpdateSection";
import { TriggerAvatar } from "./components/TriggerAvatar";
import { MENU_COPY, MENU_ROUTES } from "./constants";
import { menuRoleLabel, menuRoleTone } from "./helpers";
import { logoutItem, menuContent, navItem, triggerButton } from "./styles";

export function UserAvatarMenu() {
  const { currentUser, isAdmin } = useAuthContext();
  const { updateAvailable, latestVersion, currentVersion } = useVersionState();
  const logout = useLogout();
  const router = useRouter();

  if (!currentUser) return null;

  const showUpdate = updateAvailable && latestVersion !== null;
  const breaking = isBreakingUpdate(currentVersion, latestVersion);

  const handleLogout = async () => {
    if (logout.isPending) return;
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
          type="button"
          className={triggerButton()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="User menu"
        >
          <TriggerAvatar
            username={currentUser.username}
            avatarUrl={currentUser.avatar_url}
            updateAvailable={updateAvailable}
          />
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className={menuContent()}>
        <MenuHeaderBlock
          username={currentUser.username}
          email={currentUser.email}
          avatarUrl={currentUser.avatar_url}
          roleTone={menuRoleTone(currentUser.role)}
          roleLabel={menuRoleLabel(currentUser.role)}
        />

        {showUpdate ? (
          <MenuUpdateSection latestVersion={latestVersion} currentVersion={currentVersion} breaking={breaking} />
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem className={navItem()} onSelect={() => router.push(MENU_ROUTES.settings)}>
          <SettingsIcon />
          <span>{MENU_COPY.settings}</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={navItem()} onSelect={() => router.push(MENU_ROUTES.profile)}>
          <User />
          <span>{MENU_COPY.profile}</span>
        </DropdownMenuItem>

        {isAdmin ? (
          <DropdownMenuItem className={navItem()} onSelect={() => router.push(MENU_ROUTES.members)}>
            <Users />
            <span>{MENU_COPY.members}</span>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className={logoutItem()}
          disabled={logout.isPending}
          onSelect={(event) => {
            event.preventDefault();
            void handleLogout();
          }}
        >
          {logout.isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
          <span>{logout.isPending ? MENU_COPY.loggingOut : MENU_COPY.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
