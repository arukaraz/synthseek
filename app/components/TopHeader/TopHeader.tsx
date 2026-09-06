"use client";

import { usePrimaryNav } from "@hooks/ui/usePrimaryNav";
import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { cn } from "@utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { PLAYER_HEADER_SLOT_ID } from "@components/Player";

import { HeaderTab } from "../HeaderTab";
import { AppLogo } from "../ui/AppLogo";
import { UserAvatarMenu } from "../UserAvatarMenu";
import {
  clearButton,
  decorativeLine,
  headerContainer,
  headerContent,
  searchForm,
  searchGlow,
  searchInput,
  searchShell,
} from "./styles";
import type { TopHeaderProps } from "./types";

export function TopHeader({ onSearch, initialQuery = "" }: TopHeaderProps) {
  const { t } = useTranslation("components");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const navItems = usePrimaryNav();

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <motion.header
      data-cy="app-header"
      className={headerContainer()}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className={gradientOverlay({ direction: "toR", intensity: "subtle", rounded: "none" })} />

      <motion.div
        className={decorativeLine()}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className={headerContent()}>
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <Link href="/">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <AppLogo iconClassName="h-12 w-auto sm:h-14" wordmarkClassName="hidden sm:block sm:text-3xl" />
            </motion.div>
          </Link>

          <nav aria-label={t("header.primaryNav")} className="hidden items-center gap-0.5 sm:flex">
            {navItems.map((item) => (
              <HeaderTab
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={item.isActive}
                labelOnMobile
              />
            ))}
          </nav>
        </div>

        <form onSubmit={handleSearchSubmit} className={searchForm()} data-cy="search-form">
          <motion.div
            className={searchShell({ focused: isFocused })}
            animate={{ scale: isFocused ? 1.01 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {isFocused ? (
              <motion.div
                className={searchGlow()}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}

            <button
              type="submit"
              data-cy="search-button"
              className="absolute left-3 cursor-pointer border-0 bg-transparent p-0"
              aria-label={t("header.search")}
            >
              <Search className={cn("h-4 w-4 transition-colors", isFocused ? "text-primary-400" : "text-fg/40")} />
            </button>

            <input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={searchInput()}
              data-cy="search-input"
            />

            <div className="hidden sm:block">
              <AnimatePresence>
                {searchQuery ? (
                  <motion.button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className={clearButton()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={t("header.clearSearch")}
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </form>

        <div id={PLAYER_HEADER_SLOT_ID} className="hidden shrink-0 items-center empty:hidden sm:flex" />

        <div className="hidden shrink-0 items-center sm:flex">
          <UserAvatarMenu />
        </div>
      </div>
    </motion.header>
  );
}
