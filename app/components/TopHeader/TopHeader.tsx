"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { PLAYER_HEADER_SLOT_ID, PLAYER_MASTHEAD_SLOT_ID } from "@components/Player";
import { Avatar } from "@components/ui/Avatar";
import { isSettingsPath } from "@features/settings/helpers";
import { useOmniSearch } from "@hooks/ui/omni/useOmniSearch";
import { usePlayerDock } from "@hooks/ui/player";
import { useChromeCollapsed } from "@hooks/ui/useChromeCollapsed";
import { usePrimaryNav } from "@hooks/ui/usePrimaryNav";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";

import { SettingsLink } from "../SettingsLink";
import { AppLogo } from "../ui/AppLogo";
import { OmniBar } from "./components/OmniBar";
import { SearchEmblem } from "./components/SearchEmblem";
import { OMNI_SCOPES } from "./constants";
import {
  brandIcon,
  brandLink,
  brandWordmark,
  decorativeLine,
  headerContainer,
  headerContent,
  mastheadSlot,
  omniClose,
  omniSlot,
  playerSlot,
  rightCluster,
} from "./styles";
import type { TopHeaderProps } from "./types";

export function TopHeader({ onSearch, initialQuery, initialScope }: TopHeaderProps) {
  const { t } = useTranslation("components");
  const { currentUser } = useAuthContext();
  const playing = usePlayerDock() !== "hidden";
  const collapsed = useChromeCollapsed();
  const navItems = usePrimaryNav();
  const pathname = usePathname();
  const omni = useOmniSearch({
    initialQuery,
    initialScope,
    scopes: OMNI_SCOPES,
    shortcutEnabled: !isSettingsPath(pathname),
    onSubmit: onSearch,
  });

  return (
    <motion.header
      data-cy="app-header"
      className={headerContainer({ collapsed })}
      inert={collapsed}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className={gradientOverlay({ direction: "toR", intensity: "subtle", rounded: "none" })} />

      <motion.div
        className={decorativeLine()}
        animate={{ opacity: [0.3, 0.7, 0.3], scaleX: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className={headerContent()}>
        <Link href="/" className={brandLink()}>
          <AppLogo iconClassName={brandIcon()} wordmarkClassName={brandWordmark()} />
        </Link>

        <SearchEmblem onOpen={omni.openSearch} />

        <div className={omniSlot({ phone: omni.open ? "open" : playing ? "collapsed" : "shown" })}>
          <OmniBar omni={omni} navItems={navItems} />
        </div>

        {omni.open ? (
          <button type="button" className={omniClose()} aria-label={t("header.closeSearch")} onClick={omni.close}>
            <X className="size-5" />
          </button>
        ) : null}

        <div id={PLAYER_MASTHEAD_SLOT_ID} className={mastheadSlot({ covered: omni.open })} />

        <div id={PLAYER_HEADER_SLOT_ID} className={playerSlot()} />

        <div className={rightCluster()}>
          <SettingsLink variant="gear" />
          {currentUser ? <Avatar size="md" imageUrl={currentUser.avatar_url} username={currentUser.username} /> : null}
        </div>
      </div>
    </motion.header>
  );
}
