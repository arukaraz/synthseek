import { cva } from "class-variance-authority";

export const noticeRoot = cva("flex flex-col gap-2 rounded-lg border p-2.5 text-xs sm:p-3 sm:text-13", {
  variants: {
    variant: {
      info: "border-info-tint/30 bg-info-tint/10 text-info-faint",
      warning: "border-warning-tint/30 bg-warning-tint/10 text-warning-faint",
      danger: "border-destructive-tint/30 bg-destructive-tint/10 text-destructive-faint",
      success: "border-success-tint/30 bg-success-tint/10 text-success-faint",
    },
  },
  defaultVariants: { variant: "info" },
});

export const noticeHeader = cva("flex items-start gap-2 sm:gap-2.5");

export const noticeIcon = cva("size-4 shrink-0 mt-0.5", {
  variants: {
    variant: {
      info: "text-info-soft",
      warning: "text-warning-soft",
      danger: "text-destructive-soft",
      success: "text-success-soft",
    },
  },
  defaultVariants: { variant: "info" },
});

export const noticeTitle = cva("flex-1 text-xs font-semibold sm:text-13", {
  variants: {
    variant: {
      info: "text-info-pale",
      warning: "text-warning-pale",
      danger: "text-destructive-pale",
      success: "text-success-pale",
    },
  },
  defaultVariants: { variant: "info" },
});

export const noticeChevron = cva("size-4 shrink-0 transition-transform duration-200", {
  variants: {
    open: {
      true: "rotate-180",
      false: "rotate-0",
    },
    variant: {
      info: "text-info-soft",
      warning: "text-warning-soft",
      danger: "text-destructive-soft",
      success: "text-success-soft",
    },
  },
  defaultVariants: { open: false, variant: "info" },
});

export const noticeTrigger = cva(
  "flex w-full cursor-pointer items-start gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:gap-2.5",
  {
    variants: {
      variant: {
        info: "focus-visible:ring-info-vivid/40",
        warning: "focus-visible:ring-warning-vivid/40",
        danger: "focus-visible:ring-destructive-vivid/40",
        success: "focus-visible:ring-success-vivid/40",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

export const noticeBody = cva("flex flex-col gap-1.5 pl-6", {
  variants: {
    variant: {
      info: "text-info-faint/90",
      warning: "text-warning-faint/90",
      danger: "text-destructive-faint/90",
      success: "text-success-faint/90",
    },
  },
  defaultVariants: { variant: "info" },
});
