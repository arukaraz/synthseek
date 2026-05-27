"use client";

import { fadeIn, slideUp } from "@utils/animations";
import { decorativeBlob, glassContainer, gradientOverlay } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { gridBackgroundStyle } from "./styles";
import type { ContentShellProps } from "./types";

export function ContentShell({ children }: ContentShellProps) {
  return (
    <motion.div
      className="h-screen-minus-header relative flex overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="bg-surface absolute inset-0">
        <motion.div
          className={decorativeBlob({ color: "primary", position: "topLeft" })}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={decorativeBlob({ color: "accent", position: "bottomRight" })}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <motion.div
          className={decorativeBlob({ color: "secondary", position: "center" })}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={gridBackgroundStyle} />

      <motion.main
        className={cn(glassContainer({ blur: "none", rounded: "none", responsive: "blur" }), "flex flex-1 flex-col")}
        variants={slideUp}
      >
        <div className={gradientOverlay({ direction: "toBl", intensity: "accent", rounded: "none" })} />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </motion.main>
    </motion.div>
  );
}
