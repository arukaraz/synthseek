import { cva, type VariantProps } from "class-variance-authority";

export const bannerContainer = cva("relative z-[60] w-full border-b backdrop-blur-sm", {
  variants: {
    tone: {
      info: "border-primary-500/20 bg-primary-500/10",
      breaking: "border-accent-500/40 bg-accent-500/15",
    },
  },
  defaultVariants: { tone: "info" },
});

export type BannerContainerProps = VariantProps<typeof bannerContainer>;

export const bannerContent = cva("flex items-center justify-center gap-3 px-4 py-2 text-sm", {
  variants: {},
  defaultVariants: {},
});

export type BannerContentProps = VariantProps<typeof bannerContent>;

export const breakingPrefix = cva(
  "bg-accent-500/20 text-accent-200 mr-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
);

export const dismissButton = cva(
  "text-fg/50 hover:text-fg hover:bg-fg/10 absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors"
);

export type DismissButtonProps = VariantProps<typeof dismissButton>;
