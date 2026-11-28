import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";

export const gridBackgroundStyle: CSSProperties = {
  backgroundImage: `
    linear-gradient(var(--backdrop-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--backdrop-grid) 1px, transparent 1px)
  `,
  backgroundSize: "50px 50px",
};

export const contentShell = cva(
  "relative flex overflow-hidden short-window:h-auto short-window:overflow-visible max-sm:transition-[height] max-sm:duration-300 max-sm:ease-out motion-reduce:transition-none",
  {
    variants: {
      collapsed: {
        true: "max-sm:h-[calc(100dvh-var(--height-bottom-nav))]",
        false: "",
      },
      player: {
        hidden: "h-screen-minus-header-and-nav sm:h-screen-minus-header",
        docked: "player-metrics h-screen-minus-header-and-nav sm:h-screen-minus-header",
      },
      chain: {
        true: "player-metrics-chain",
        false: "",
      },
    },
    defaultVariants: { player: "hidden", chain: false, collapsed: false },
  }
);
