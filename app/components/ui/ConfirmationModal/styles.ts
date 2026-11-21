import { cva, type VariantProps } from "class-variance-authority";

export const confirmIconBadge = cva(
  "relative flex size-11 shrink-0 items-center justify-center rounded-full border [&_svg]:size-5",
  {
    variants: {
      variant: {
        danger: "border-destructive-strong/35 bg-destructive-strong/12 text-destructive-strong",
        warning: "border-warning-strong/35 bg-warning-strong/12 text-warning-strong",
        info: "border-secondary-500/35 bg-secondary-500/12 text-secondary-500",
        success: "border-success-strong/35 bg-success-strong/12 text-success-strong",
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
          "border border-destructive-strong/40 bg-destructive-strong/18 hover:bg-destructive-strong/28 focus-visible:ring-destructive-strong/60",
        warning:
          "border border-warning-strong/40 bg-warning-strong/18 hover:bg-warning-strong/28 focus-visible:ring-warning-strong/60",
        info: "border border-secondary-500/40 bg-secondary-500/18 hover:bg-secondary-500/28 focus-visible:ring-secondary-500/60",
        success:
          "border border-success-strong/40 bg-success-strong/18 hover:bg-success-strong/28 focus-visible:ring-success-strong/60",
      },
    },
    defaultVariants: { variant: "danger" },
  }
);

export type ConfirmActionButtonProps = VariantProps<typeof confirmActionButton>;

export const confirmDialogContent = "max-w-md bg-surface/95";

export const confirmFooter = "mt-6 flex-row gap-3";

export const confirmFooterButton = cva("max-sm:h-11 max-sm:text-15", {
  variants: {
    paired: { true: "flex-1 sm:flex-none", false: "w-full" },
  },
  defaultVariants: { paired: true },
});

export const confirmBody = "mt-5 flex flex-col gap-4";
