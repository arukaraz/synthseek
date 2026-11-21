import { cva } from "class-variance-authority";

export const previewButton = cva(
  "focus-visible:ring-primary-400 grid place-items-center transition-[transform,background-color,opacity] outline-none focus-visible:ring-2 motion-reduce:transition-none",
  {
    variants: {
      tone: {
        overlay:
          "bg-surface-overlay/70 ring-overlay-fg/20 relative size-11 shrink-0 rounded-full shadow-lg ring-1 backdrop-blur-sm",
        row: "bg-fg/5 ring-fg/10 relative size-9 shrink-0 rounded-full ring-1",
        cover:
          "absolute inset-0 size-full bg-veil/65 opacity-0 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-inset data-[preview=error]:opacity-100 data-[preview=loading]:opacity-100 data-[preview=playing]:opacity-100 [@media(hover:none)]:opacity-100",
      },
      state: {
        ready: "cursor-pointer",
        locked: "cursor-help",
        failed: "text-warning-vivid cursor-help",
      },
    },
    compoundVariants: [
      { tone: ["overlay", "cover"], state: ["ready", "locked"], class: "text-overlay-fg" },
      { tone: "row", state: ["ready", "locked"], class: "text-fg" },
      { tone: ["overlay", "row"], state: "ready", class: "hover:scale-105 motion-reduce:hover:scale-100" },
      { tone: ["overlay", "row"], state: "locked", class: "opacity-55" },
    ],
    defaultVariants: { tone: "row", state: "ready" },
  }
);

export const previewGlyph = cva("", {
  variants: {
    tone: {
      overlay: "size-4.5",
      row: "size-3.75",
      cover: "size-4",
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
      cover: "stroke-overlay-fg/15",
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
