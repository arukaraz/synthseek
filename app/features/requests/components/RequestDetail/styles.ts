import { cva, type VariantProps } from "class-variance-authority";

export const jspfExportDialogContent = cva("flex w-full max-w-sm flex-col gap-4 p-6");

export const detailContainer = cva("h-full overflow-y-auto", {
  variants: {},
  defaultVariants: {},
});

export type DetailContainerProps = VariantProps<typeof detailContainer>;

export const heroBanner = cva("relative h-56 w-full overflow-hidden sm:h-64", {
  variants: {},
  defaultVariants: {},
});

export type HeroBannerProps = VariantProps<typeof heroBanner>;

export const heroBannerOverlay = cva(
  "from-surface via-surface absolute inset-0 bg-linear-to-t from-0% via-0% to-transparent to-100%",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type HeroBannerOverlayProps = VariantProps<typeof heroBannerOverlay>;

export const heroBannerImage = cva("scale-110 object-cover object-center opacity-40 blur-2xl", {
  variants: {},
  defaultVariants: {},
});

export type HeroBannerImageProps = VariantProps<typeof heroBannerImage>;

export const heroAvatar = cva(
  "from-primary-500/30 to-accent-500/30 ring-fg/10 relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br shadow-xl ring-1",
  {
    variants: {
      size: {
        md: "size-20 sm:size-24",
        lg: "size-24 sm:size-28",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
);

export type HeroAvatarProps = VariantProps<typeof heroAvatar>;

export const heroAvatarTypeBadge = cva(
  "bg-surface/80 ring-fg/20 absolute bottom-1 left-1 flex size-6 items-center justify-center rounded-md ring-1 backdrop-blur-sm",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type HeroAvatarTypeBadgeProps = VariantProps<typeof heroAvatarTypeBadge>;

export const detailStatCard = cva("border-fg/10 bg-fg/5 flex flex-col gap-1 rounded-xl border p-3 sm:p-4", {
  variants: {},
  defaultVariants: {},
});

export type DetailStatCardProps = VariantProps<typeof detailStatCard>;

export const heroContent = cva("relative z-10 -mt-20 px-3 pb-4 sm:-mt-24 sm:px-4 sm:pb-6", {
  variants: {},
  defaultVariants: {},
});

export type HeroContentProps = VariantProps<typeof heroContent>;

export const heroMoreButton = cva(
  "border-fg/10 bg-fg/5 text-fg/60 hover:bg-fg/10 hover:text-fg/90 rounded-lg border p-1.5 transition-colors",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type HeroMoreButtonProps = VariantProps<typeof heroMoreButton>;

export const detailStatsGrid = cva("grid grid-cols-2 gap-3 px-3 pb-4 sm:px-4", {
  variants: {
    columns: {
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
    },
  },
  defaultVariants: {
    columns: 4,
  },
});

export type DetailStatsGridProps = VariantProps<typeof detailStatsGrid>;

export const heroMetaValue = cva("text-primary-300");

export type HeroMetaValueProps = VariantProps<typeof heroMetaValue>;

export const priorityChip = cva(
  "border-primary-500/30 bg-primary-500/10 text-primary-300 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
);

export type PriorityChipProps = VariantProps<typeof priorityChip>;
