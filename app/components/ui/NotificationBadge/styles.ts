import { cva } from "class-variance-authority";

export const notificationBadge = cva(
  "ring-surface border-secondary-400 bg-secondary-600 text-secondary-foreground shadow-secondary-500/50 flex items-center justify-center rounded-full border shadow-md ring-2 motion-safe:animate-pulse",
  {
    variants: {
      placement: {
        corner: "absolute -top-1.5 -right-1.5 h-5 w-5",
        inline: "h-2 w-2 shrink-0",
      },
    },
    defaultVariants: { placement: "corner" },
  }
);
