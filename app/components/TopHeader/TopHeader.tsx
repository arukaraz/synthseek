"use client";

import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { cn } from "@utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, Settings as SettingsIcon, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { HeaderTab } from "../HeaderTab";
import { LogoIcon } from "../ui/LogoIcon";
import { UserAvatarMenu } from "../UserAvatarMenu";
import {
  clearButton,
  decorativeLine,
  headerContainer,
  headerContent,
  mobileSearchClose,
  mobileSearchTrigger,
  searchForm,
  searchGlow,
  searchInput,
  searchShell,
} from "./styles";
import type { TopHeaderProps } from "./types";

export function TopHeader({ onSearch, initialQuery = "" }: TopHeaderProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const isDiscoverActive = pathname === "/" || pathname === "";
  const isRequestsActive = pathname.startsWith("/requests");
  const isSettingsActive = pathname.startsWith("/settings");

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (isSearchOpen && mobileInputRef.current) {
      const timer = setTimeout(() => mobileInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleCloseMobileSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleCloseMobileSearch();
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
            <motion.div className="flex items-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <LogoIcon />
              <h1
                className="gradient-text-primary ml-px hidden text-2xl sm:block sm:text-3xl"
                style={{ fontFamily: "var(--font-courgette)" }}
              >
                ynthseek
              </h1>
            </motion.div>
          </Link>

          <nav aria-label="Primary" className={cn("flex items-center gap-0.5", isSearchOpen && "hidden sm:flex")}>
            <HeaderTab href="/" icon={Sparkles} label="Discover" isActive={isDiscoverActive} />
            <HeaderTab href="/requests" icon={Menu} label="Requests" isActive={isRequestsActive} labelOnMobile />
            <HeaderTab href="/settings" icon={SettingsIcon} label="Settings" isActive={isSettingsActive} hideOnMobile />
          </nav>
        </div>

        {!isSearchOpen && (
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={mobileSearchTrigger()}
            aria-label="Search"
            title="Search"
          >
            <Search className="size-4" />
          </button>
        )}

        <form onSubmit={handleSearchSubmit} className={searchForm({ open: isSearchOpen })} data-cy="search-form">
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
              aria-label="Search"
            >
              <Search className={cn("h-4 w-4 transition-colors", isFocused ? "text-primary-400" : "text-fg/40")} />
            </button>

            <input
              ref={mobileInputRef}
              type="text"
              placeholder="Search tracks, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleSearchKeyDown}
              className={searchInput()}
              data-cy="search-input"
            />

            <button
              type="button"
              onClick={handleCloseMobileSearch}
              className={mobileSearchClose()}
              aria-label="Close search"
            >
              <X className="size-3.5" />
            </button>

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
                    aria-label="Clear search"
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

        <div className="flex shrink-0 items-center">
          <UserAvatarMenu />
        </div>
      </div>
    </motion.header>
  );
}
