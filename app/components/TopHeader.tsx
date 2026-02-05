"use client";

import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { cn } from "@utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { ListMusic, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NavIcon } from "./NavIcon";
import { headerContainer, decorativeLine, headerContent, searchGlow, clearButton } from "./TopHeader/styles";
import { headerSearchInput } from "./ui/styles";
import { LogoIcon } from "./ui/LogoIcon";
import { UserAvatarMenu } from "./UserAvatarMenu";

interface AppHeaderProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
}

export default function AppHeader({ onSearch, initialQuery = "" }: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const pathname = usePathname();

  const isDiscoverActive = pathname === "/" || pathname === "";
  const isRequestsActive = pathname.startsWith("/requests");

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
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/">
            <motion.div className="flex items-center" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <div className="flex items-center">
                <LogoIcon />
                <h1
                  className="gradient-text-primary ml-px hidden text-2xl sm:block sm:text-3xl"
                  style={{ fontFamily: "var(--font-courgette)" }}
                >
                  ynthseek
                </h1>
              </div>
            </motion.div>
          </Link>

          <form onSubmit={handleSearchSubmit} className="ml-2 w-48 sm:ml-4 sm:w-64 lg:w-80" data-cy="search-form">
            <div className="relative">
              <motion.div
                className={cn(
                  "relative flex items-center rounded-xl border transition-all",
                  isFocused
                    ? "border-primary-500/50 bg-primary-500/5 shadow-primary-500/20 shadow-lg"
                    : "border-fg/10 bg-fg/5"
                )}
                animate={{
                  scale: isFocused ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {isFocused && (
                  <motion.div
                    className={searchGlow()}
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                <button
                  type="submit"
                  data-cy="search-button"
                  className="absolute left-3 cursor-pointer border-0 bg-transparent p-0"
                  aria-label="Search"
                >
                  <Search className={cn("h-4 w-4 transition-colors", isFocused ? "text-primary-400" : "text-fg/40")} />
                </button>

                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={headerSearchInput()}
                  data-cy="search-input"
                />

                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className={clearButton()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </form>

          <NavIcon
            icon={Sparkles}
            label="Discover"
            href="/"
            isActive={isDiscoverActive}
            activeColor="primary"
            shimmer
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <NavIcon
            icon={ListMusic}
            label="Requests"
            href="/requests"
            isActive={isRequestsActive}
            activeColor="accent"
          />

          <UserAvatarMenu />
        </div>
      </div>
    </motion.header>
  );
}
