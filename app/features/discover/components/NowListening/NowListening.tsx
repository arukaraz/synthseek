"use client";

import { fadeIn } from "@utils/animations";
import { gradientOverlay } from "@theme/utilities/styles";
import { glassPanelCard } from "../styles";
import { motion } from "framer-motion";
import { Headphones } from "lucide-react";

export function NowListening() {
  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className={glassPanelCard()}>
      <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-4">
          <h3 className="text-fg text-lg font-semibold">Now Listening</h3>
          <p className="text-fg/60 text-xs">Track your session</p>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Headphones className="text-fg/20 mx-auto mb-2 h-12 w-12" />
            <p className="text-fg/40 text-sm">Coming soon</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
