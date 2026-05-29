import { cva } from "class-variance-authority";

export const noticeRoot = cva("flex flex-col gap-2 rounded-lg border p-2.5 text-xs sm:p-3 sm:text-[13px]", {
  variants: {
    variant: {
      info: "border-sky-500/30 bg-sky-500/10 text-sky-100",
      warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
      danger: "border-red-500/30 bg-red-500/10 text-red-100",
      success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
    },
  },
  defaultVariants: { variant: "info" },
});

export const noticeHeader = cva("flex items-start gap-2 sm:gap-2.5");

export const noticeIcon = cva("size-4 shrink-0 mt-0.5", {
  variants: {
    variant: {
      info: "text-sky-300",
      warning: "text-amber-300",
      danger: "text-red-300",
      success: "text-emerald-300",
    },
  },
  defaultVariants: { variant: "info" },
});

export const noticeTitle = cva("flex-1 text-xs font-semibold sm:text-[13px]", {
  variants: {
    variant: {
      info: "text-sky-200",
      warning: "text-amber-200",
      danger: "text-red-200",
      success: "text-emerald-200",
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
      info: "text-sky-300",
      warning: "text-amber-300",
      danger: "text-red-300",
      success: "text-emerald-300",
    },
  },
  defaultVariants: { open: false, variant: "info" },
});

export const noticeTrigger = cva(
  "flex w-full cursor-pointer items-start gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:gap-2.5",
  {
    variants: {
      variant: {
        info: "focus-visible:ring-sky-400/40",
        warning: "focus-visible:ring-amber-400/40",
        danger: "focus-visible:ring-red-400/40",
        success: "focus-visible:ring-emerald-400/40",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

export const noticeBody = cva("flex flex-col gap-1.5 pl-6", {
  variants: {
    variant: {
      info: "text-sky-100/90",
      warning: "text-amber-100/90",
      danger: "text-red-100/90",
      success: "text-emerald-100/90",
    },
  },
  defaultVariants: { variant: "info" },
});
