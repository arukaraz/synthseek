"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowUpCircle, X } from "lucide-react";
import { useCallback, useState } from "react";

import { isBreakingUpdate } from "@utils/version";

import { bannerContainer, bannerContent, breakingPrefix, dismissButton } from "./styles";

interface UpdateBannerProps {
  latestVersion: string;
  currentVersion: string;
}

const PATCH_NOTES_URL = "https://github.com/arukaraz/synthseek/blob/main/PATCH-NOTES.md";

export function UpdateBanner({ latestVersion, currentVersion }: UpdateBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  const breaking = isBreakingUpdate(currentVersion, latestVersion);
  const tone = breaking ? "breaking" : "info";

  return (
    <AnimatePresence>
      {!dismissed ? (
        <motion.div
          className={bannerContainer({ tone })}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className={bannerContent()}>
            {breaking ? (
              <motion.span
                className="text-accent-300"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
              </motion.span>
            ) : (
              <ArrowUpCircle className="text-primary-400 h-4 w-4 shrink-0" aria-hidden />
            )}

            <p className="text-fg/90">
              {breaking ? <span className={breakingPrefix()}>Major update</span> : null}
              <span className="font-medium">Version {latestVersion}</span> is available
              {breaking ? <span className="text-fg/70 ml-1">— review patch notes before upgrading</span> : null}
              <span className="text-fg/50 ml-1.5 text-xs">(current: {currentVersion})</span>
              <a
                href={PATCH_NOTES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  breaking
                    ? "bg-accent-500/20 text-accent-200 hover:bg-accent-500/30 ml-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors"
                    : "text-primary-400 hover:text-primary-300 ml-2 text-xs underline transition-colors"
                }
              >
                Patch Notes
              </a>
            </p>
          </div>

          <motion.button
            className={dismissButton()}
            onClick={handleDismiss}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
