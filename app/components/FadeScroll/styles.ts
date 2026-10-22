import { cva } from "class-variance-authority";

export const fadeScroll = cva("min-w-0", {
  variants: {
    axis: {
      x: "overflow-x-auto overscroll-x-contain",
      y: "flex min-h-0 flex-1 flex-col overflow-y-auto",
    },
  },
  defaultVariants: { axis: "y" },
});

export const fadeScrollFrame = cva("relative flex min-h-0 min-w-0 flex-1 flex-col");

export const scrollEdge = cva(
  "pointer-events-none absolute inset-y-0 z-10 flex w-12 items-start justify-center pt-3 transition-opacity duration-200",
  {
    variants: {
      side: {
        left: "left-0",
        right: "right-0",
      },
      shade: {
        true: "via-surface/45 from-surface to-transparent",
        false: "",
      },
      visible: {
        true: "opacity-100",
        false: "invisible opacity-0",
      },
    },
    compoundVariants: [
      { side: "left", shade: true, className: "bg-linear-to-r" },
      { side: "right", shade: true, className: "bg-linear-to-l" },
    ],
    defaultVariants: { shade: false, visible: false },
  }
);

export const scrollEdgeButton = cva(
  "text-fg/80 hover:text-fg bg-surface/80 border-fg/10 focus-visible:ring-fg/40 pointer-events-auto flex size-7 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
);
