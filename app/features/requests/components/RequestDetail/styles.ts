import { cva, type VariantProps } from "class-variance-authority";

export const jspfExportDialogContent = cva("flex w-full max-w-sm flex-col gap-4 p-6");

export const detailContainer = cva("h-full overflow-y-auto", {
  variants: {},
  defaultVariants: {},
});

export type DetailContainerProps = VariantProps<typeof detailContainer>;

export const heroBanner = cva(
  "absolute inset-x-0 top-0 h-24 w-full overflow-hidden md:relative md:inset-auto md:h-64",
  {
    variants: {},
    defaultVariants: {},
  }
);

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

export const heroContent = cva("relative z-10 px-3 pb-4 md:-mt-24 md:px-4 md:pb-6", {
  variants: {},
  defaultVariants: {},
});

export type HeroContentProps = VariantProps<typeof heroContent>;

export const heroMoreButton = cva(
  "border-fg/10 bg-fg/5 text-fg/60 hover:bg-fg/10 hover:text-fg/90 rounded-lg border p-1.5 transition-colors"
);

export type HeroMoreButtonProps = VariantProps<typeof heroMoreButton>;

export const heroMoreButtonDesktop = cva(
  "border-fg/10 bg-fg/5 text-fg/60 hover:bg-fg/10 hover:text-fg/90 hidden rounded-lg border p-1.5 transition-colors md:inline-flex"
);

export type HeroMoreButtonDesktopProps = VariantProps<typeof heroMoreButtonDesktop>;

export const heroMoreButtonMobile = cva(
  "border-fg/10 bg-fg/5 text-fg/60 hover:bg-fg/10 hover:text-fg/90 inline-flex shrink-0 rounded-lg border p-1.5 transition-colors md:hidden"
);

export type HeroMoreButtonMobileProps = VariantProps<typeof heroMoreButtonMobile>;

export const heroDeleteMenuItem = cva(
  "text-destructive-vivid hover:bg-destructive-vivid/10 hover:text-destructive-vivid focus:bg-destructive-vivid/10 focus:text-destructive-vivid active:bg-destructive-vivid/15 gap-2.5 py-2"
);

export type HeroDeleteMenuItemProps = VariantProps<typeof heroDeleteMenuItem>;

export const heroWarningMenuItem = cva(
  "text-warning-vivid hover:bg-warning-vivid/10 hover:text-warning-vivid focus:bg-warning-vivid/10 focus:text-warning-vivid active:bg-warning-vivid/15 gap-2.5 py-2"
);

export type HeroWarningMenuItemProps = VariantProps<typeof heroWarningMenuItem>;

export const heroSuccessMenuItem = cva(
  "text-success-vivid hover:bg-success-vivid/10 hover:text-success-vivid focus:bg-success-vivid/10 focus:text-success-vivid active:bg-success-vivid/15 gap-2.5 py-2"
);

export type HeroSuccessMenuItemProps = VariantProps<typeof heroSuccessMenuItem>;

export const heroRetryButton = cva(
  "border-primary-500/30 bg-primary-500/10 text-primary-300 hover:border-primary-500/50 hover:bg-primary-500/20 hover:text-primary-200 hidden md:inline-flex"
);

export type HeroRetryButtonProps = VariantProps<typeof heroRetryButton>;

export const heroRetryMenuItem = cva("text-primary-400 focus:text-primary-300 md:hidden");

export type HeroRetryMenuItemProps = VariantProps<typeof heroRetryMenuItem>;

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

export const heroTypeRow = cva("flex items-center justify-between gap-2");

export type HeroTypeRowProps = VariantProps<typeof heroTypeRow>;

export const heroIdentityBlock = cva("order-2 flex items-end gap-3 sm:gap-4 md:order-none");

export type HeroIdentityBlockProps = VariantProps<typeof heroIdentityBlock>;

export const heroControlsColumn = cva("hidden md:flex md:w-auto md:flex-col md:items-end md:gap-3");

export type HeroControlsColumnProps = VariantProps<typeof heroControlsColumn>;

export const heroLastUpdated = cva("hidden text-right text-xs text-fg/40 md:order-none md:block");

export type HeroLastUpdatedProps = VariantProps<typeof heroLastUpdated>;

export const heroMobileTopRow = cva("pt-2 mb-8 flex items-center justify-between gap-2 md:hidden");

export type HeroMobileTopRowProps = VariantProps<typeof heroMobileTopRow>;

export const heroMobileLastUpdated = cva("text-right text-xs text-fg/40");

export type HeroMobileLastUpdatedProps = VariantProps<typeof heroMobileLastUpdated>;

export const heroMobileStatus = cva("md:hidden");

export type HeroMobileStatusProps = VariantProps<typeof heroMobileStatus>;

export const heroDesktopStatus = cva("hidden md:inline-flex");

export type HeroDesktopStatusProps = VariantProps<typeof heroDesktopStatus>;

export const heroControlsRow = cva("flex items-center gap-2 md:flex-wrap md:justify-end");

export type HeroControlsRowProps = VariantProps<typeof heroControlsRow>;

export const heroControlsCluster = cva("flex items-center gap-2");

export type HeroControlsClusterProps = VariantProps<typeof heroControlsCluster>;

export const heroBackButton = cva("shrink-0");

export type HeroBackButtonProps = VariantProps<typeof heroBackButton>;

export const priorityChip = cva(
  "border-primary-500/30 bg-primary-500/10 text-primary-300 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
);

export type PriorityChipProps = VariantProps<typeof priorityChip>;
