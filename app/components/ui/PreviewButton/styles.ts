import { cva } from "class-variance-authority";

export const previewButton = cva(
  "focus-visible:ring-primary-400 relative grid shrink-0 place-items-center rounded-full transition-[transform,background-color,opacity] outline-none focus-visible:ring-2 motion-reduce:transition-none",
  {
    variants: {
      tone: {
        overlay: "bg-surface-overlay/70 text-overlay-fg ring-overlay-fg/20 size-11 shadow-lg ring-1 backdrop-blur-sm",
        row: "bg-fg/5 text-fg ring-fg/10 size-9 ring-1",
      },
      state: {
        ready: "cursor-pointer hover:scale-105 motion-reduce:hover:scale-100",
        locked: "cursor-help opacity-55",
        failed: "text-warning-vivid cursor-help",
      },
    },
    defaultVariants: { tone: "row", state: "ready" },
  }
);

export const previewGlyph = cva("", {
  variants: {
    tone: {
      overlay: "size-[18px]",
      row: "size-[15px]",
    },
  },
  defaultVariants: { tone: "row" },
});

export const previewRing = cva("pointer-events-none absolute inset-0 size-full -rotate-90 fill-none stroke-[3]");

export const previewRingRest = cva("", {
  variants: {
    tone: {
      overlay: "stroke-overlay-fg/15",
      row: "stroke-fg/10",
    },
  },
  defaultVariants: { tone: "row" },
});

export const previewRingBar = cva("stroke-accent-400 [stroke-linecap:round]", {
  variants: {
    status: {
      idle: "opacity-0",
      error: "opacity-0",
      loading: "origin-center animate-spin motion-reduce:animate-none",
      playing: "transition-[stroke-dashoffset] duration-300 ease-linear motion-reduce:transition-none",
    },
  },
  defaultVariants: { status: "idle" },
});

export const previewTime = cva("tabular-nums");
