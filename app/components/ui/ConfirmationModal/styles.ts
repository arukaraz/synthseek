import { cva, type VariantProps } from "class-variance-authority";

export const confirmIconBadge = cva(
  "relative flex size-11 shrink-0 items-center justify-center rounded-full border [&_svg]:size-5",
  {
    variants: {
      variant: {
        danger:
          "border-[oklch(var(--neon-error)/0.35)] bg-[oklch(var(--neon-error)/0.12)] text-[oklch(var(--neon-error))]",
        warning:
          "border-[oklch(var(--neon-warning)/0.35)] bg-[oklch(var(--neon-warning)/0.12)] text-[oklch(var(--neon-warning))]",
        info: "border-[oklch(var(--neon-secondary)/0.35)] bg-[oklch(var(--neon-secondary)/0.12)] text-[oklch(var(--neon-secondary))]",
        success:
          "border-[oklch(var(--neon-success)/0.35)] bg-[oklch(var(--neon-success)/0.12)] text-[oklch(var(--neon-success))]",
      },
    },
    defaultVariants: { variant: "danger" },
  }
);

export type ConfirmIconBadgeProps = VariantProps<typeof confirmIconBadge>;

export const confirmActionButton = cva(
  "font-semibold text-fg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        danger:
          "border border-[oklch(var(--neon-error)/0.4)] bg-[oklch(var(--neon-error)/0.18)] hover:bg-[oklch(var(--neon-error)/0.28)] focus-visible:ring-[oklch(var(--neon-error)/0.6)]",
        warning:
          "border border-[oklch(var(--neon-warning)/0.4)] bg-[oklch(var(--neon-warning)/0.18)] hover:bg-[oklch(var(--neon-warning)/0.28)] focus-visible:ring-[oklch(var(--neon-warning)/0.6)]",
        info: "border border-[oklch(var(--neon-secondary)/0.4)] bg-[oklch(var(--neon-secondary)/0.18)] hover:bg-[oklch(var(--neon-secondary)/0.28)] focus-visible:ring-[oklch(var(--neon-secondary)/0.6)]",
        success:
          "border border-[oklch(var(--neon-success)/0.4)] bg-[oklch(var(--neon-success)/0.18)] hover:bg-[oklch(var(--neon-success)/0.28)] focus-visible:ring-[oklch(var(--neon-success)/0.6)]",
      },
    },
    defaultVariants: { variant: "danger" },
  }
);

export type ConfirmActionButtonProps = VariantProps<typeof confirmActionButton>;

export const confirmDialogContent = "max-w-md bg-surface/95 sm:bg-surface/90 sm:backdrop-blur-2xl";

export const confirmFooter = "mt-6 gap-2 sm:gap-3";
