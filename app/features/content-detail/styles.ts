import { cva } from "class-variance-authority";

export const modalContainer = cva(
  "bg-surface/95 !flex !flex-col !gap-0 !overflow-hidden !px-0 !pt-0 shadow-2xl sm:!top-0 sm:!pb-0 sm:!bottom-auto sm:!left-1/2 sm:!h-[100dvh] sm:!max-h-[100dvh] sm:!w-[min(65rem,100%)] sm:!max-w-none sm:!-translate-x-1/2 sm:!translate-y-0 sm:!rounded-none sm:!border-0"
);

export const modalShell = cva(
  "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto outline-none sm:overflow-hidden"
);

export const modalLayout = cva("flex min-w-0 flex-col sm:min-h-0 sm:flex-1");

export const modalScrollArea = cva(
  "flex flex-col gap-8 overflow-x-hidden px-5 pt-6 pb-8 sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:px-8 sm:pt-8"
);

export const miniStickyRoot = cva("pointer-events-none sticky top-0 z-30 h-0 sm:hidden");

export const miniBar = cva(
  "border-fg/10 bg-surface/95 flex items-center gap-3 border-b pb-3 pl-4 pr-14 pt-[max(1rem,env(safe-area-inset-top,0px))] transition-all duration-200",
  {
    variants: {
      visible: {
        true: "pointer-events-auto translate-y-0 opacity-100",
        false: "pointer-events-none -translate-y-1 opacity-0",
      },
    },
    defaultVariants: { visible: false },
  }
);

export const miniBack = cva(
  "border-fg/15 text-fg hover:bg-fg/10 grid size-9 shrink-0 place-items-center rounded-full border transition-colors"
);

export const miniThumb = cva("bg-surface ring-fg/10 relative size-9 shrink-0 overflow-hidden ring-1", {
  variants: {
    shape: { round: "rounded-full", square: "rounded-md" },
  },
  defaultVariants: { shape: "square" },
});

export const miniImage = cva("h-full w-full object-cover");

export const miniInitials = cva("text-fg/70 grid h-full w-full place-items-center text-xs font-bold");

export const miniName = cva("text-fg min-w-0 truncate text-base font-bold");

export const modalGrid = cva("grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]");

export const modalMain = cva("flex min-w-0 flex-col gap-8");

export const modalSide = cva("flex min-w-0 flex-col gap-8");

export const modalFullRow = cva("flex flex-col gap-8");

export const backBar = cva("relative z-20 -mb-3 flex shrink-0 px-5 pt-4 sm:-mb-5 sm:px-8 sm:pt-5");

export const backButton = cva(
  "border-fg/15 bg-veil/40 text-overlay-fg hover:bg-veil/55 flex min-h-9 items-center gap-1.5 self-start rounded-full border px-3.5 py-1.5 text-sm font-semibold backdrop-blur-md transition-colors"
);

export const hero = cva(
  "relative isolate flex min-w-0 shrink-0 flex-col items-center gap-5 rounded-2xl p-5 pt-7 text-center sm:flex-row sm:items-center sm:gap-10 sm:p-7 sm:text-left lg:gap-14"
);

export const heroCover = cva(
  "from-primary-500/20 to-accent-500/20 ring-fg/10 relative shrink-0 overflow-hidden bg-linear-to-br ring-1",
  {
    variants: {
      shape: {
        round: "size-32 rounded-full sm:size-40",
        square: "size-32 rounded-xl sm:size-40",
      },
    },
    defaultVariants: {
      shape: "square",
    },
  }
);

export const heroImage = cva("h-full w-full object-cover");

export const heroInitials = cva("text-fg/70 flex h-full w-full items-center justify-center text-4xl font-bold");

export const heroInfo = cva("@container flex w-full min-w-0 flex-col items-center gap-3 sm:flex-1 sm:items-start");

export const heroTop = cva(
  "flex w-full min-w-0 flex-col items-center gap-4 sm:items-start @2xl:flex-row @2xl:items-center @2xl:gap-7"
);

export const heroIdentity = cva("flex w-full min-w-0 flex-col items-center gap-3 sm:items-start @2xl:flex-1");

export const heroMeta = cva("flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:justify-start");

export const heroName = cva("text-fg font-bold tracking-tight sm:leading-[1.05]", {
  variants: {
    size: {
      default: "text-3xl sm:text-[clamp(2rem,3vw,2.875rem)]",
      compact: "text-2xl sm:text-[clamp(1.5rem,2.2vw,2rem)]",
    },
  },
  defaultVariants: { size: "default" },
});

export const heroSubtitle = cva("text-fg/60 text-sm");

export const heroSubtitleButton = cva(
  "text-fg/60 hover:text-accent-400 cursor-pointer text-sm underline-offset-2 transition-colors hover:underline"
);

export const heroTags = cva("flex flex-wrap items-center justify-center gap-2 sm:justify-start");

export const heroActions = cva(
  "mt-2 flex w-full min-w-0 items-center justify-center gap-2 sm:mt-3 sm:flex-wrap sm:justify-start sm:gap-3",
  {
    variants: {
      crowded: {
        true: "flex-wrap",
        false: "flex-nowrap",
      },
    },
    defaultVariants: { crowded: false },
  }
);

export const heroStats = cva("flex w-full justify-center sm:justify-start @2xl:w-auto @2xl:shrink-0");

export const alreadyInLibrary = cva(
  "border-secondary-500/30 bg-secondary-500/10 text-secondary-400 focus-visible:ring-secondary-400 grid size-10.5 place-items-center rounded-full border focus-visible:ring-2 focus-visible:outline-none"
);

export const genreChip = cva(
  "border-fg/10 bg-fg/5 text-fg/70 inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize"
);

export const statRow = cva("flex flex-wrap justify-center sm:justify-start", {
  variants: {
    layout: {
      aside:
        "items-start gap-x-7 gap-y-2.5 text-center sm:text-left @2xl:grid @2xl:grid-cols-[auto_auto] @2xl:gap-y-3 @2xl:text-right",
      inline: "items-center gap-x-3 gap-y-1",
    },
  },
  defaultVariants: { layout: "aside" },
});

export const statCell = cva("flex", {
  variants: {
    layout: {
      aside: "flex-col @2xl:odd:last:col-start-2",
      inline: "items-baseline gap-1.5 whitespace-nowrap",
    },
  },
  defaultVariants: { layout: "aside" },
});

export const statValue = cva("text-fg tabular-nums", {
  variants: {
    layout: {
      aside: "text-xl leading-tight font-bold",
      inline: "text-sm font-semibold",
    },
  },
  defaultVariants: { layout: "aside" },
});

export const statLabel = cva("", {
  variants: {
    layout: {
      aside: "text-fg/50 text-xs",
      inline: "text-fg/60 text-sm",
    },
  },
  defaultVariants: { layout: "aside" },
});

export const statSkeleton = cva("bg-fg/5 h-12 w-56 max-w-full animate-pulse rounded-xl");

export const sectionRoot = cva("flex flex-col gap-4");

export const sectionTitle = cva("text-fg text-lg font-semibold tracking-tight");

export const sectionHeaderRow = cva("flex flex-wrap items-center gap-x-2.5 gap-y-1.5");

export const sectionCount = cva("text-fg/50 font-mono text-xs tabular-nums");

export const sectionDivider = cva("bg-fg/10 h-px min-w-6 flex-1");

export const sectionTrailing = cva("flex shrink-0 items-center gap-2");

export const sectionSkeleton = cva("bg-fg/5 w-full animate-pulse rounded-xl");

export const sectionEmpty = cva("text-fg/50 text-sm");

export const trackRow = cva(
  "group border-fg/5 flex items-center gap-2 rounded-lg border-b px-2 py-2.5 transition-colors last:border-b-0",
  {
    variants: {
      previewing: {
        true: "bg-accent-500/10",
        false: "hover:bg-fg/5",
      },
    },
    defaultVariants: { previewing: false },
  }
);

export const trackTime = cva("", {
  variants: {
    tone: {
      rest: "",
      previewing: "text-accent-400 font-semibold",
      failed: "text-warning-vivid",
    },
  },
  defaultVariants: { tone: "rest" },
});

export const trackInfo = cva("flex min-w-0 flex-1 flex-col");

export const trackTitle = cva("text-fg truncate text-sm font-medium");

export const trackArtist = cva("text-fg/50 truncate text-xs");

export const trackArtistLink = cva(
  "text-fg/50 hover:text-accent-400 max-w-full cursor-pointer self-start truncate text-left text-xs underline-offset-2 transition-colors hover:underline"
);

export const trackMeta = cva("text-fg/50 flex shrink-0 items-center gap-2.5 text-xs tabular-nums");

export const trackStatusCell = cva("flex w-16 shrink-0 items-center justify-end gap-1");

export const trackRetryButton = cva(
  "text-fg/50 hover:text-fg focus-visible:ring-primary-400 flex size-7 shrink-0 items-center justify-center rounded-full transition-[color,background-color,opacity] hover:bg-fg/10 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none sm:opacity-0 sm:group-hover:opacity-100"
);

export const trackStatusIcon = cva("flex size-5 shrink-0 items-center justify-center");

export const trackPlaybackActions = cva("flex shrink-0 items-center gap-0.5");

export const trackPlayButton = cva(
  "focus-visible:ring-primary-400 grid size-7 shrink-0 place-items-center rounded-full transition-[color,opacity] focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
  {
    variants: {
      current: {
        true: "text-primary-400 hover:text-primary-500",
        false: "text-fg/45 hover:text-fg sm:opacity-0 sm:group-hover:opacity-100",
      },
    },
    defaultVariants: { current: false },
  }
);

export const cardGridRow = cva("grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5");

export const cardButton = cva("group flex w-full min-w-0 flex-col gap-2 text-left");

export const cardCover = cva(
  "from-primary-500/20 to-accent-500/20 ring-fg/10 relative aspect-square w-full overflow-hidden rounded-lg bg-linear-to-br ring-1"
);

export const cardImage = cva("h-full w-full object-cover transition-transform group-hover:scale-[1.03]");

export const cardScrim = cva(
  "pointer-events-none absolute inset-0 bg-linear-to-b from-veil/60 via-veil/15 to-transparent"
);

export const cardScrimBottom = cva(
  "pointer-events-none absolute inset-0 bg-linear-to-t from-veil/65 via-veil/10 to-transparent"
);

export const cardInitials = cva("text-fg/70 flex h-full w-full items-center justify-center text-2xl font-bold");

export const cardMarker = cva(
  "border-accent-500 bg-accent-500/10 text-overlay-fg-accent group-hover:bg-accent-500 group-hover:text-accent-foreground absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full border backdrop-blur-sm transition-colors"
);

export const cardMarkerDownload = cva("size-3.5");

export const cardRingWrap = cva("absolute top-1.5 right-1.5 grid size-7 place-items-center");

export const cardRing = cva("absolute inset-0");

export const cardRingDisc = cva("absolute inset-[3px] grid place-items-center rounded-full bg-veil/70");

export const cardRingCheck = cva("text-success-vivid relative z-10 size-3");

export const cardRingCount = cva("relative z-10 text-9 font-semibold tabular-nums text-overlay-fg");

export const cardBody = cva("flex min-w-0 flex-col gap-0.5 px-0.5");

export const cardCount = cva(
  "absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1.5 font-mono text-xs font-semibold tabular-nums text-overlay-fg"
);

export const cardCountDot = cva("size-2 shrink-0 rounded-full", {
  variants: {
    state: {
      full: "bg-success-strong",
      partial: "bg-warning-strong",
      none: "bg-destructive-strong",
    },
  },
  defaultVariants: { state: "none" },
});

export const cardTitle = cva("text-fg line-clamp-2 text-sm font-semibold");

export const cardSubtitle = cva("text-fg/60 truncate text-xs");

export const similarCard = cva("flex w-24 shrink-0 flex-col items-center gap-2 text-center");

export const similarAvatar = cva(
  "from-primary-500/20 to-accent-500/20 ring-fg/10 relative size-24 overflow-hidden rounded-full bg-linear-to-br ring-1"
);

export const similarImage = cva("h-full w-full object-cover");

export const similarInitials = cva("text-fg/70 flex h-full w-full items-center justify-center text-lg font-bold");

export const similarName = cva("text-fg/80 line-clamp-2 text-xs font-medium");

export const factsList = cva("flex flex-col gap-2.5");

export const factRow = cva("flex items-baseline justify-between gap-4");

export const factLabel = cva("text-fg/50 shrink-0 text-sm");

export const factValue = cva("text-fg/80 min-w-0 truncate text-right text-sm");

export const factListRow = cva("flex flex-col gap-1.5");

export const factBulletList = cva("flex flex-col gap-1");

export const factBulletItem = cva("text-fg/80 flex items-baseline gap-2 text-sm");

export const factBullet = cva("text-primary-400 shrink-0 leading-none");

export const bioText = cva("text-fg/70 text-sm leading-relaxed whitespace-pre-line");

export const bioClamped = cva("line-clamp-6");

export const bioToggle = cva("text-accent-400 hover:text-accent-500 mt-1.5 text-xs font-semibold");

export const bioSource = cva("mt-3 flex");

export const bioSourceLink = cva(
  "focus-visible:ring-primary-400 rounded-full opacity-90 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2"
);

export const railWrap = cva("group/rail relative min-w-0");

export const railTrack = cva("scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-2");

export const railCardSlot = cva("w-36 shrink-0");

export const railNav = cva(
  "border-fg/10 bg-fg/5 text-fg/60 hover:text-fg hover:border-primary-500/40 hover:bg-primary-500/10 grid size-7 place-items-center rounded-full border transition-colors"
);
