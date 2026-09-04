import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";

export const gridBackgroundStyle: CSSProperties = {
  backgroundImage: `
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
  `,
  backgroundSize: "50px 50px",
};

export const contentShell = cva("relative flex overflow-hidden", {
  variants: {
    player: {
      hidden: "h-screen-minus-header-and-nav sm:h-screen-minus-header",
      docked:
        "player-metrics h-[calc(var(--height-screen-minus-header-and-nav)-var(--player-dock-height))] sm:h-[calc(var(--height-screen-minus-header)-var(--player-dock-height))]",
    },
    chain: {
      true: "player-metrics-chain",
      false: "",
    },
  },
  defaultVariants: { player: "hidden", chain: false },
});
