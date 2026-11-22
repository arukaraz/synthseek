import { cva, type VariantProps } from "class-variance-authority";

export const jspfExportDialogContent = cva("flex w-full max-w-sm flex-col gap-4 p-6");

export const trackStatusLine = cva("flex min-w-0 items-center gap-1.5");

export const trackStatusIndicator = cva("min-w-0");

export const trackStatusPercent = cva("text-fg/50 shrink-0 text-xs tabular-nums");

export const trackSource = cva("flex min-w-0 items-center gap-1.5");

export const trackSourceLabel = cva("text-fg/60 min-w-0 truncate text-xs");

export const trackSourceLicense = cva(
  "text-fg/40 hover:text-fg/80 focus-visible:text-fg/80 shrink-0 rounded outline-none transition-colors"
);

export const trackSourceEmpty = cva("text-fg/40 text-xs");

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
  "from-primary-500/30 to-accent-500/30 ring-fg/10 relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br shadow-xl ring-1",
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

export const heroAvatarButton = cva(
  "hover:ring-primary-500/60 focus-visible:ring-primary-500/60 cursor-pointer outline-none transition-shadow hover:ring-2 focus-visible:ring-2"
);

export type HeroAvatarButtonProps = VariantProps<typeof heroAvatarButton>;

export const heroTitle = cva("text-fg text-xl font-bold drop-shadow-sm sm:text-2xl", {
  variants: {
    interactive: {
      true: "",
      false: "truncate",
    },
  },
  defaultVariants: {
    interactive: false,
  },
});

export type HeroTitleProps = VariantProps<typeof heroTitle>;

export const heroTitleButton = cva(
  "hover:text-primary-400 focus-visible:ring-primary-500/60 block w-fit max-w-full cursor-pointer truncate rounded-sm text-left underline-offset-4 transition-colors outline-none hover:underline focus-visible:ring-2"
);

export type HeroTitleButtonProps = VariantProps<typeof heroTitleButton>;

export const heroAvatarTypeBadge = cva(
  "bg-surface/80 ring-fg/20 absolute bottom-1 left-1 flex size-6 items-center justify-center rounded-md ring-1 backdrop-blur-sm",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type HeroAvatarTypeBadgeProps = VariantProps<typeof heroAvatarTypeBadge>;

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
  "border-primary-500/30 bg-primary-500/10 text-primary-400 hover:border-primary-500/50 hover:bg-primary-500/20 hidden md:inline-flex"
);

export type HeroRetryButtonProps = VariantProps<typeof heroRetryButton>;

export const heroRetryMenuItem = cva("text-primary-400 md:hidden");

export type HeroRetryMenuItemProps = VariantProps<typeof heroRetryMenuItem>;

export const heroMetaValue = cva("text-primary-400");

export type HeroMetaValueProps = VariantProps<typeof heroMetaValue>;

export const heroTypeRow = cva("flex items-center justify-between gap-2");

export type HeroTypeRowProps = VariantProps<typeof heroTypeRow>;

export const heroIdentityBlock = cva("order-2 flex min-w-0 items-end gap-3 sm:gap-4 md:order-none md:flex-1");

export type HeroIdentityBlockProps = VariantProps<typeof heroIdentityBlock>;

export const heroControlsColumn = cva("hidden md:flex md:w-auto md:shrink-0 md:flex-col md:items-end md:gap-3");

export type HeroControlsColumnProps = VariantProps<typeof heroControlsColumn>;

export const heroLastUpdated = cva("hidden text-right text-xs text-fg/40 md:order-none md:block");

export type HeroLastUpdatedProps = VariantProps<typeof heroLastUpdated>;

export const heroMobileTopRow = cva("pt-2 mb-8 flex items-center justify-between gap-2 md:hidden");

export type HeroMobileTopRowProps = VariantProps<typeof heroMobileTopRow>;

export const heroMobileLastUpdated = cva("text-right text-xs text-fg/40");

export type HeroMobileLastUpdatedProps = VariantProps<typeof heroMobileLastUpdated>;

export const heroControlsRow = cva("flex items-center gap-2 md:flex-wrap md:justify-end");

export type HeroControlsRowProps = VariantProps<typeof heroControlsRow>;

export const heroControlsCluster = cva("flex items-center gap-2");

export type HeroControlsClusterProps = VariantProps<typeof heroControlsCluster>;

export const heroBackButton = cva("shrink-0");

export type HeroBackButtonProps = VariantProps<typeof heroBackButton>;

export const priorityChip = cva(
  "border-primary-500/30 bg-primary-500/10 text-primary-400 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-10 font-medium"
);

export type PriorityChipProps = VariantProps<typeof priorityChip>;

export const rejectReasonInput = cva(
  "border-fg/10 bg-fg/5 text-fg placeholder:text-fg/35 focus:border-primary-500/50 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none"
);

export type RejectReasonInputProps = VariantProps<typeof rejectReasonInput>;

export const releaseStack = cva("flex flex-col gap-3 px-3 pb-4 sm:px-4");

export const releaseCard = cva("flex flex-col gap-2 rounded-xl border p-3 sm:p-4", {
  variants: {
    tone: {
      fetching: "border-primary-500/25 bg-primary-500/5",
      queued: "border-warning-vivid/30 bg-warning-vivid/5",
      kept: "border-fg/10 bg-fg/5",
    },
  },
  defaultVariants: { tone: "fetching" },
});

export const releaseCardHeader = cva("flex min-w-0 items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0");

export const releaseCardTitle = cva("text-fg min-w-0 flex-1 text-sm font-semibold");

export const releaseCardPercent = cva("text-primary-400 shrink-0 text-sm font-bold tabular-nums");

export const releaseCardText = cva("text-fg/60 text-xs");

export const releaseCardName = cva("text-fg/40 truncate font-mono text-xs");

export const keptCardRow = cva("flex flex-wrap items-center gap-3");

export const keptCardBody = cva("flex min-w-0 flex-1 flex-col gap-0.5");

export const keptInfoTrigger = cva("ml-1.5 align-middle");

export const summaryBlock = cva("flex flex-col gap-3 px-3 pb-4 sm:px-4");

export const summaryFraction = cva("flex flex-wrap items-baseline gap-x-3 gap-y-1");

export const summaryFigure = cva("text-fg text-2xl font-bold tabular-nums sm:text-3xl");

export const summaryFigurePart = cva("text-base font-semibold sm:text-lg", {
  variants: {
    tone: {
      active: "text-status-downloading",
      total: "text-fg/40",
    },
  },
});

export const summaryMeta = cva("text-fg/50 text-xs");

export const summaryBar = cva("bg-fg/10 flex h-2 w-full gap-px overflow-hidden rounded-full");

export const summaryBarSegment = cva("h-full first:rounded-l-full last:rounded-r-full");

export const summaryChips = cva("flex flex-wrap items-center gap-2");

export const summaryChip = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors outline-none focus-visible:ring-primary-500/60 focus-visible:ring-2",
  {
    variants: {
      active: {
        true: "border-fg/30 bg-fg/10 text-fg",
        false: "border-fg/10 bg-fg/5 text-fg/70 hover:bg-fg/10 hover:text-fg",
      },
      dimmed: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: { active: false, dimmed: false },
  }
);

export const summaryChipDot = cva("size-2 shrink-0 rounded-full");

export const summaryChipCount = cva("text-fg font-semibold tabular-nums");

export const summaryNote = cva("border-fg/10 bg-fg/5 flex flex-col gap-1 rounded-xl border p-3 text-sm sm:p-4");

export const sortNote = cva("text-fg/60 mx-3 mb-2 flex flex-wrap items-center gap-2 text-xs sm:mx-4");

export const sortNoteLabel = cva("inline-flex items-center gap-1.5 [&_svg]:size-3.5");

export const sortHeaderGroup = cva("flex items-center gap-1.5");

export const sortHeaderButton = cva("flex items-center gap-1 uppercase transition-colors [&_svg]:size-3.5", {
  variants: {
    active: {
      true: "text-fg",
      false: "text-fg/80 hover:text-fg/90",
    },
  },
  defaultVariants: { active: false },
});

export const trackNumber = cva("text-fg/40 block text-right text-xs tabular-nums");

export const trackTitleButton = cva(
  "flex w-full min-w-0 cursor-pointer flex-col items-start gap-0.5 rounded-sm text-left outline-none focus-visible:ring-primary-500/60 focus-visible:ring-2"
);

export const trackTitleText = cva("flex w-full min-w-0 items-center gap-1.5 text-sm", {
  variants: {
    tone: {
      done: "text-fg/80",
      muted: "text-fg/50",
      default: "text-fg/90",
    },
  },
  defaultVariants: { tone: "default" },
});

export const trackTitleLabel = cva("min-w-0 truncate");

export const explicitMark = cva(
  "border-fg/20 text-fg/50 shrink-0 rounded-sm border px-1 text-9 leading-tight font-semibold"
);

export const trackArtistLine = cva("text-fg/45 w-full truncate text-xs");

export const trackInlineStatus = cva("w-full pt-0.5 @xl:hidden");

export const trackStatusStack = cva("flex min-w-0 flex-col gap-0.5");

export const retryLine = cva("text-fg/45 flex flex-wrap items-center gap-x-1.5 text-xs [&_svg]:size-3");

export const retryLinePart = cva("inline-flex items-center gap-1 whitespace-nowrap");

export const detailPanel = cva("flex flex-col gap-3 pl-0 @xl:pl-10");

export const detailHead = cva("flex flex-wrap items-start gap-3 rounded-xl border p-3", {
  variants: {
    tone: {
      failed: "border-status-failed/30 bg-status-failed/5",
      active: "border-status-downloading/30 bg-status-downloading/5",
      neutral: "border-fg/10 bg-fg/5",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export const detailHeadIcon = cva("shrink-0");

export const detailHeadBody = cva("flex min-w-0 flex-1 flex-col gap-1");

export const detailHeadTitle = cva("text-fg text-sm font-semibold");

export const detailHeadText = cva("text-fg/60 text-xs");

export const detailRawError = cva(
  "border-fg/10 bg-surface/60 text-fg/70 mt-1 max-h-40 overflow-auto rounded-lg border p-2 font-mono text-11 break-all whitespace-pre-wrap"
);

export const detailRawErrorSummary = cva("text-fg/50 hover:text-fg/80 cursor-pointer text-xs");

export const detailProgress = cva("bg-fg/10 h-1.5 w-full max-w-sm overflow-hidden rounded-full");

export const detailProgressFill = cva("bg-status-downloading h-full rounded-full transition-[width]");

export const detailGrid = cva("grid items-start gap-3 @3xl:grid-cols-3");

export const detailBox = cva("border-fg/10 bg-fg/[0.03] flex min-w-0 flex-col gap-2 rounded-xl border p-3");

export const detailBoxTitle = cva("text-fg/40 text-10 font-semibold tracking-wider uppercase");

export const detailChips = cva("flex flex-wrap gap-1.5");

export const detailChip = cva("rounded-md border px-1.5 py-0.5 text-11", {
  variants: {
    strong: {
      true: "border-fg/20 bg-fg/10 text-fg font-semibold",
      false: "border-fg/10 text-fg/70",
    },
  },
  defaultVariants: { strong: false },
});

export const detailFacts = cva("grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs");

export const detailFactLabel = cva("text-fg/45");

export const detailFactValue = cva("text-fg/80 min-w-0 break-words", {
  variants: {
    mono: {
      true: "font-mono text-11",
      false: "",
    },
  },
  defaultVariants: { mono: false },
});

export const detailPath = cva(
  "border-fg/10 bg-surface/60 flex min-w-0 items-start gap-2 rounded-lg border p-2 font-mono text-11"
);

export const detailPathText = cva("text-fg/70 min-w-0 flex-1 break-all");

export const detailPathCopy = cva(
  "text-fg/50 hover:text-fg shrink-0 rounded outline-none transition-colors focus-visible:ring-primary-500/60 focus-visible:ring-2 [&_svg]:size-3.5"
);

export const detailEmpty = cva("text-fg/45 text-xs");

export const detailLink = cva("text-primary-400 hover:underline");

export const detailActions = cva("flex flex-wrap justify-end gap-2");

export const trackActionTone = cva("", {
  variants: {
    tone: {
      default: "",
      success: "text-success-vivid hover:text-success-soft",
      primary: "text-primary-400",
      danger: "text-destructive-vivid hover:text-destructive-soft",
    },
  },
  defaultVariants: { tone: "default" },
});

export const lockedReason = cva("text-fg/40 block text-11");

export const menuItemBody = cva("flex min-w-0 flex-1 flex-col");

export const heroLockNote = cva("text-fg/45 inline-flex items-center gap-1.5 text-xs [&_svg]:size-3.5");

export const bulkBarWrap = cva("sticky bottom-3 z-20 mx-3 mb-3 flex justify-center sm:mx-4");

export const bulkBarFloating = cva("mb-0 shadow-lg backdrop-blur-md");

export const tracksLoadFailed = cva("flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center");

export type TracksLoadFailedProps = VariantProps<typeof tracksLoadFailed>;
