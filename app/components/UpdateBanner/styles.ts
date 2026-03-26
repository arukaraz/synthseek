import { cva, type VariantProps } from "class-variance-authority";

export const bannerContainer = cva(
  "relative z-[60] w-full border-b border-primary-500/20 bg-primary-500/10 backdrop-blur-sm",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type BannerContainerProps = VariantProps<typeof bannerContainer>;

export const bannerContent = cva("flex items-center justify-center gap-3 px-4 py-2 text-sm", {
  variants: {},
  defaultVariants: {},
});

export type BannerContentProps = VariantProps<typeof bannerContent>;

export const dismissButton = cva(
  "text-fg/50 hover:text-fg hover:bg-fg/10 absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type DismissButtonProps = VariantProps<typeof dismissButton>;
