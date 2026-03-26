"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpCircle, X } from "lucide-react";
import { useCallback, useState } from "react";
import { bannerContainer, bannerContent, dismissButton } from "./UpdateBanner/styles";

interface UpdateBannerProps {
  latestVersion: string;
  currentVersion: string;
}

export function UpdateBanner({ latestVersion, currentVersion }: UpdateBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className={bannerContainer()}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className={bannerContent()}>
            <ArrowUpCircle className="text-primary-400 h-4 w-4 shrink-0" />
            <p className="text-fg/90">
              <span className="font-medium">Version {latestVersion}</span> is available
              <span className="text-fg/50 ml-1.5 text-xs">(current: {currentVersion})</span>
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
      )}
    </AnimatePresence>
  );
}
