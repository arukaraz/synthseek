import { cva } from "class-variance-authority";

export const workshopSurface = cva(
  "player-workshop bg-surface border-fg/10 fixed inset-x-0 z-50 flex min-h-0 flex-col border-b shadow-2xl outline-none max-sm:top-16 max-sm:bottom-[var(--height-bottom-nav)] sm:top-0",
  {
    variants: {
      dock: {
        hidden: "sm:bottom-0",
        bar: "player-metrics sm:bottom-[var(--player-dock-height)]",
        chain: "player-metrics player-metrics-chain sm:bottom-[var(--player-dock-height)]",
      },
      chain: {
        true: "player-workshop-chain",
        false: "",
      },
    },
    defaultVariants: { dock: "hidden", chain: false },
  }
);

export const workshopHead = cva(
  "border-fg/10 flex shrink-0 flex-wrap items-center gap-x-3.5 gap-y-3 border-b px-3 py-3 sm:px-4.5 sm:py-3.5"
);

export const workshopIdentity = cva("flex min-w-0 flex-[1_1_260px] items-center gap-3");

export const workshopCover = cva(
  "from-primary-500/20 to-accent-500/20 ring-fg/10 relative size-11 shrink-0 overflow-hidden rounded-lg bg-linear-to-br ring-1 sm:size-14"
);

export const workshopCoverImage = cva("h-full w-full object-cover");

export const workshopCoverInitials = cva("text-fg/70 grid h-full w-full place-items-center text-lg font-bold");

export const workshopTitles = cva("flex min-w-0 flex-1 flex-col");

export const workshopBadge = cva("text-accent-400 text-[11px] font-bold tracking-[0.08em] uppercase");

export const workshopName = cva("text-fg truncate text-xl font-bold tracking-tight");

export const workshopMeta = cva(
  "text-fg/60 flex flex-wrap items-center gap-x-2.5 text-xs [&>span+span]:before:mr-2.5 [&>span+span]:before:content-['·']"
);

export const workshopTools = cva("flex shrink-0 items-center gap-2");

export const workshopDivider = cva("bg-fg/15 h-5.5 w-px shrink-0");

export const workshopIconButton = cva(
  "text-fg/60 hover:bg-fg/10 hover:text-fg focus-visible:ring-primary-400 grid size-9 shrink-0 place-items-center rounded-md transition-colors outline-none focus-visible:ring-2"
);

export const workshopTabs = cva("border-fg/10 shrink-0 border-b px-3 pt-1");

export const workshopBody = cva("flex min-h-0 flex-1");

export const workshopPane = cva("flex min-h-0 min-w-0 flex-col", {
  variants: {
    role: {
      details: "border-fg/10 lg:w-[300px] lg:shrink-0 lg:border-r max-lg:flex-1",
      tracks: "flex-1",
      suggested: "border-fg/10 lg:w-[340px] lg:shrink-0 lg:border-l xl:w-[430px] max-lg:flex-1",
    },
  },
});

export const workshopScroll = cva("min-h-0 flex-1 overflow-y-auto overscroll-contain");

export const workshopLoading = cva("bg-fg/5 m-4 h-72 animate-pulse rounded-xl");

export const workshopError = cva("text-fg/60 p-6 text-sm");

export const tracksHead = cva("flex flex-wrap items-center gap-2.5 px-4.5 pt-3 pb-2");

export const tracksSelectAll = cva("text-fg/60 flex items-center gap-2 text-xs font-semibold");

export const tracksHint = cva("text-fg/45 ml-auto text-xs");

export const tracksBulk = cva("mx-3 mb-1.5 w-auto");

export const tracksList = cva("px-2 pb-4");

export const tracksNotice = cva("text-fg/60 border-fg/10 bg-fg/5 mx-3 mb-2 rounded-lg border px-3 py-2 text-xs");

export const tracksEmpty = cva("text-fg/50 p-6 text-center text-sm");

export const rowGrip = cva(
  "text-fg/40 hover:bg-fg/10 hover:text-fg focus-visible:ring-primary-400 grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-md outline-none focus-visible:ring-2 active:cursor-grabbing"
);

export const rowSelect = cva("flex w-5 shrink-0 items-center justify-center");

export const rowRemove = cva(
  "focus-visible:ring-primary-400 grid size-7 shrink-0 place-items-center rounded-full transition-colors outline-none focus-visible:ring-2 disabled:opacity-30",
  {
    variants: {
      current: {
        true: "text-destructive-vivid hover:bg-destructive-vivid/10",
        false: "text-fg/50 hover:bg-fg/10 hover:text-destructive-vivid",
      },
    },
    defaultVariants: { current: false },
  }
);

export const rowDragging = cva("bg-surface ring-primary-400/50 relative z-10 shadow-xl ring-1");

export const detailsBody = cva("flex flex-col gap-4.5 p-4.5");

export const field = cva("flex flex-col gap-1.5");

export const fieldLabel = cva("text-fg/50 text-[11px] font-bold tracking-[0.08em] uppercase");

export const nameInput = cva(
  "border-fg/10 bg-fg/5 text-fg focus:border-primary-500/60 focus:ring-primary-500/30 w-full rounded-[10px] border px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-60"
);

export const visibilityGrid = cva("grid grid-cols-2 gap-1.5");

export const visibilityOption = cva(
  "focus-visible:ring-primary-400 flex flex-col items-start gap-0.5 rounded-[10px] border p-2.5 text-left text-sm outline-none focus-visible:ring-2 disabled:opacity-60",
  {
    variants: {
      active: {
        true: "border-primary-500 bg-primary-500/15",
        false: "border-fg/10 hover:bg-fg/5",
      },
    },
    defaultVariants: { active: false },
  }
);

export const visibilityTitle = cva("text-fg font-semibold");

export const visibilityHint = cva("text-fg/60 text-xs");

export const facts = cva("grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 text-[13px]");

export const factTerm = cva("text-fg/50");

export const factValue = cva("text-fg/90 flex min-w-0 justify-end text-right");

export const actionList = cva("border-fg/10 flex flex-col overflow-hidden rounded-lg border");

export const actionRow = cva(
  "border-fg/10 flex min-h-[42px] w-full items-center gap-2.5 px-3 text-left text-[13px] font-semibold not-first:border-t outline-none disabled:opacity-60",
  {
    variants: {
      tone: {
        default: "text-fg hover:bg-fg/5 focus-visible:bg-fg/5 [&>svg]:text-fg/60",
        danger: "text-destructive-vivid hover:bg-destructive-vivid/10 focus-visible:bg-destructive-vivid/10",
      },
    },
    defaultVariants: { tone: "default" },
  }
);

export const actionRowLabel = cva("min-w-0 flex-1 truncate");

export const coverBlock = cva("flex items-center gap-3");

export const coverPreview = cva(
  "from-primary-500/20 to-accent-500/20 ring-fg/10 relative size-[72px] shrink-0 overflow-hidden rounded-lg bg-linear-to-br ring-1"
);

export const coverActions = cva("flex min-w-0 flex-1 flex-col items-start gap-1.5");

export const coverButton = cva(
  "focus-visible:ring-primary-400 inline-flex h-8 max-w-full items-center gap-2 rounded-md border px-2.5 text-[13px] font-semibold outline-none focus-visible:ring-2 disabled:opacity-60",
  {
    variants: {
      tone: {
        default: "border-fg/15 text-fg hover:bg-fg/10 [&>svg]:text-fg/60",
        quiet: "text-fg/60 hover:text-destructive-vivid border-transparent",
      },
    },
    defaultVariants: { tone: "default" },
  }
);

export const importSummary = cva(
  "border-primary-500/40 bg-primary-500/10 mt-2 flex flex-col gap-1.5 rounded-lg border p-3"
);

export const importMissList = cva("text-fg/60 flex max-h-32 min-w-0 flex-col gap-0.5 overflow-y-auto text-[12px]");

export const importMissItem = cva("truncate");

export const importText = cva("text-[13px]", {
  variants: {
    tone: {
      default: "text-fg font-semibold",
      quiet: "text-fg/60",
    },
  },
  defaultVariants: { tone: "default" },
});

export const importActions = cva("mt-1 flex flex-wrap gap-2");

export const importButton = cva(
  "focus-visible:ring-primary-400 inline-flex h-8 items-center rounded-md border px-3 text-[13px] font-semibold outline-none focus-visible:ring-2 disabled:opacity-60",
  {
    variants: {
      tone: {
        default: "border-fg/15 text-fg/70 hover:bg-fg/10 hover:text-fg",
        primary: "border-primary-500 bg-primary-500 text-primary-foreground hover:bg-primary-400",
      },
    },
    defaultVariants: { tone: "default" },
  }
);

export const actionRowHint = cva("text-fg/45 text-xs font-medium whitespace-nowrap");
