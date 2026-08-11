import { cva } from "class-variance-authority";

export const modalRoot = cva(
  [
    "!flex w-full flex-col gap-0 overflow-hidden p-0 shadow-2xl !border-0",
    "h-[100dvh] !max-h-[100dvh] !rounded-none !top-0 !left-0 !translate-x-0",
    "sm:!top-[50%] sm:!left-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%]",
    "sm:h-modal-max sm:!max-h-[90vh] sm:max-w-[1380px] sm:!rounded-2xl",
  ].join(" ")
);

export const modalGrid = cva(
  "grid h-full min-h-0 w-full min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto_1fr_auto]"
);

export const connectPrompt = cva("flex h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center");

export const connectPromptIcon = cva(
  "flex size-16 items-center justify-center rounded-full bg-[#1ed760]/15 text-[#1ed760]"
);

export const connectPromptTitle = cva("text-fg text-lg font-semibold");

export const connectPromptBody = cva("text-fg/60 max-w-sm text-sm");

export const topbar = cva("flex items-center gap-3 border-b border-fg/10 bg-surface/60 px-4 py-3 text-sm");

export const brandChip = cva("inline-flex items-center gap-2 rounded-lg bg-fg/5 px-2 py-1 text-sm font-medium text-fg");

export const brandIcon = cva("flex size-5 items-center justify-center rounded text-[#1ed760]", {
  variants: { tone: { spotify: "bg-[#1ed760]/15" } },
  defaultVariants: { tone: "spotify" },
});

export const toolbar = cva("flex w-full min-w-0 items-center gap-2 border-b border-fg/10 bg-fg/[0.015] px-4 py-2");

export const searchBox = cva("relative min-w-0 flex-1");

export const searchInput = cva(
  "h-9 w-full min-w-0 rounded-lg border border-fg/10 bg-fg/[0.03] px-9 text-sm text-fg outline-none placeholder:text-fg/40 focus:border-primary-500/40"
);

export const split = cva("flex h-full min-h-0 w-full min-w-0 flex-col md:flex-row");

export const masterScroll = cva(
  "h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto bg-surface/40 md:border-r md:border-fg/10",
  {
    variants: {
      hiddenOnMobile: {
        true: "hidden md:flex",
        false: "flex",
      },
    },
    defaultVariants: { hiddenOnMobile: false },
  }
);

export const detailPaneWrapper = cva("h-full min-h-0 w-full flex-col md:w-[380px] md:shrink-0", {
  variants: {
    hiddenOnMobile: {
      true: "hidden md:flex",
      false: "flex",
    },
  },
  defaultVariants: { hiddenOnMobile: false },
});

export const masterControls = cva("px-3 pt-3");
export const masterXScroll = cva("w-full min-w-0 max-w-full overflow-x-auto");

export const masterEmpty = cva("flex flex-1 items-center justify-center p-12 text-sm text-fg/40");
export const detailLoading = cva("flex h-full items-center justify-center p-12 text-sm text-fg/40");

export const table = cva("w-full min-w-[680px] table-fixed border-collapse text-sm");

export const tableHead = cva(
  "sticky top-0 z-10 bg-surface px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-fg/40"
);

export const tableRow = cva("cursor-pointer border-b border-fg/[0.04] transition-colors hover:bg-fg/[0.015]", {
  variants: {
    selected: { true: "bg-primary-500/[0.06]", false: "" },
    focused: { true: "bg-primary-500/[0.14] shadow-[inset_2px_0_0_var(--color-primary-400)]", false: "" },
  },
  defaultVariants: { selected: false, focused: false },
  compoundVariants: [{ selected: true, focused: true, className: "bg-primary-500/[0.14]" }],
});

export const tableCell = cva("px-3 py-2 text-fg/70");
export const tableCellName = cva("flex items-center gap-2.5 px-3 py-2 text-fg font-medium");
export const tableCellMono = cva("px-3 py-2 text-fg/60 font-mono text-xs text-right");
export const tableCellMonoDim = cva("px-3 py-2 text-fg/40 font-mono text-xs");

export const coverThumb = cva("size-7 shrink-0 overflow-hidden rounded bg-fg/10");

export const heartThumb = cva(
  "flex size-7 shrink-0 items-center justify-center rounded bg-linear-to-br from-rose-500/20 to-fuchsia-500/20 text-rose-400"
);

export const coverPlaceholder = cva(
  "size-7 shrink-0 rounded bg-linear-to-br from-primary-700 to-cyan-500/40 bg-[length:8px_8px] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_8px)]"
);

export const typeTag = cva("inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium", {
  variants: {
    tone: {
      playlist: "bg-primary-500/15 text-primary-400",
      album: "bg-cyan-500/15 text-cyan-300",
      liked: "bg-rose-500/15 text-rose-300",
    },
  },
});

export const stPill = cva("inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium", {
  variants: {
    tone: {
      imported: "bg-emerald-500/10 text-emerald-400",
      disabled: "bg-fg/5 text-fg/50",
    },
  },
});

export const stDot = cva("size-1.5 rounded-full", {
  variants: {
    tone: { imported: "bg-emerald-400", disabled: "bg-fg/40" },
  },
});

export const syncPill = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      on: {
        true: "border-primary-500/30 bg-primary-500/15 text-primary-400 hover:border-primary-500/45 hover:text-fg",
        false: "border-fg/10 bg-fg/[0.03] text-fg/40 hover:border-fg/20 hover:text-fg/60",
      },
    },
  }
);

export const syncDot = cva("size-1 rounded-full", {
  variants: { on: { true: "bg-primary-400 shadow-[0_0_5px_var(--color-primary-400)]", false: "bg-fg/40" } },
});

export const syncDash = cva("text-fg/30 font-mono text-xs select-none");

export const checkBox = cva(
  "inline-flex size-[18px] shrink-0 items-center justify-center rounded border transition-colors",
  {
    variants: {
      on: {
        true: "border-transparent bg-linear-to-br from-primary-500 to-primary-700 text-fg",
        false: "border-fg/20 bg-fg/[0.02] hover:border-primary-500/50",
      },
    },
  }
);

export const detailPane = cva("flex h-full min-h-0 flex-col overflow-y-auto bg-surface");

export const detailHero = cva(
  "relative border-b border-fg/[0.06] bg-[radial-gradient(400px_200px_at_100%_0%,color-mix(in_oklch,var(--color-primary-700)_12%,transparent),transparent_60%)] px-5 py-5"
);

export const detailCrumb = cva("mb-3 pl-10 mb-5 font-mono text-[10px] uppercase tracking-[0.1em] text-fg/40 md:pl-0");

export const detailCoverRow = cva("flex items-start gap-3.5");

export const detailCoverImg = cva("size-20 shrink-0 overflow-hidden rounded-lg shadow-xl");

export const detailHeartImg = cva(
  "flex size-20 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-rose-500/35 to-fuchsia-500/25 text-rose-300 shadow-xl"
);

export const detailCoverPlaceholderLg = cva(
  "size-20 shrink-0 rounded-lg bg-linear-to-br from-primary-700 to-cyan-500/40 bg-[length:8px_8px] shadow-xl [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_8px)]"
);

export const detailH2 = cva("text-lg font-bold leading-tight tracking-tight text-fg");

export const detailBy = cva("mt-1 flex items-center gap-1.5 text-xs text-fg/60");

export const detailByDot = cva("size-[2px] rounded-full bg-fg/30");

export const detailActions = cva("mt-4 flex gap-2");

export const detailAct = cva(
  "flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-fg/10 bg-fg/5 px-3 py-2 text-xs font-medium text-fg/70 transition-colors hover:border-fg/20 hover:text-fg",
  {
    variants: {
      primary: {
        true: "border-transparent bg-linear-to-br from-primary-500 to-primary-700 text-fg shadow-[0_2px_10px_color-mix(in_oklch,var(--color-primary-700)_35%,transparent)] hover:border-transparent hover:text-fg",
        false: "",
      },
    },
    defaultVariants: { primary: false },
  }
);

export const detailSection = cva("border-b border-fg/[0.06] px-5 py-4");

export const detailSectionTitle = cva(
  "mb-3 flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-fg/40"
);

export const detailSectionTitleLine = cva("h-px flex-1 bg-fg/[0.06]");

export const cfgRow = cva(
  "flex items-center justify-between gap-3 rounded-lg border border-fg/[0.06] bg-fg/[0.02] px-3 py-2.5 text-xs"
);

export const cfgRowLabel = cva("font-medium text-fg");
export const cfgRowDesc = cva("mt-0.5 text-[11px] leading-tight text-fg/40");

export const metaGrid = cva("grid grid-cols-[110px_1fr] gap-x-3.5 gap-y-1.5 text-xs");
export const metaKey = cva("text-fg/40");
export const metaVal = cva("font-mono text-fg");
export const metaValFull = cva("text-fg/40 ml-2 text-[10.5px]");
export const metaValText = cva("text-fg");

export const trackList = cva("-mx-5 flex flex-col");
export const trackRow = cva(
  "grid grid-cols-[24px_1fr_50px] items-center gap-2.5 px-5 py-1.5 text-xs hover:bg-fg/[0.025]"
);
export const trackPos = cva("text-center font-mono text-[11px] text-fg/40");
export const trackTitle = cva("truncate font-medium text-fg");
export const trackArtist = cva("block truncate text-[11px] font-normal text-fg/50");
export const trackDur = cva("text-right font-mono text-[11px] text-fg/40");
export const trackMore = cva("cursor-pointer px-5 pt-2 text-[11px] text-primary-400 hover:text-fg");

export const detailEmpty = cva("flex h-full flex-col items-center justify-center gap-3.5 p-12 text-center");
export const detailEmptyArt = cva("relative inline-flex size-24 items-center justify-center text-fg/40");
export const detailEmptyCard = cva(
  "absolute flex w-14 h-16 flex-col justify-end gap-1 rounded-lg border border-dashed border-fg/20 bg-fg/[0.015] p-2",
  {
    variants: {
      pos: {
        left: "-translate-x-[18px] translate-y-[6px] -rotate-[9deg]",
        center: "z-10 border-solid border-fg/20 bg-fg/[0.04]",
        right: "translate-x-[18px] translate-y-[6px] rotate-[9deg]",
      },
    },
  }
);
export const detailEmptyCardLine = cva("h-[3px] rounded-sm bg-fg/10", {
  variants: { short: { true: "w-3/5", false: "" } },
  defaultVariants: { short: false },
});
export const detailEmptyTitle = cva("mt-1 text-base font-semibold tracking-tight text-fg");
export const detailEmptyBody = cva("max-w-[280px] text-[12.5px] leading-relaxed text-fg/60");
export const detailEmptyHints = cva("mt-2 flex flex-wrap justify-center gap-2.5");
export const detailEmptyHint = cva("inline-flex items-center gap-1.5 text-[11px] text-fg/40");
export const detailEmptyKbd = cva(
  "rounded border border-fg/10 bg-fg/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-fg/70"
);

export const bottombar = cva(
  "flex w-full min-w-0 flex-col items-stretch gap-3 border-t border-fg/10 bg-surface/60 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:flex-wrap sm:items-center sm:pb-3"
);
export const bottombarLeft = cva("flex min-w-0 flex-wrap items-center gap-3");
export const bottombarRight = cva(
  "flex min-w-0 flex-col items-stretch gap-3 sm:ml-auto sm:flex-row sm:flex-wrap sm:items-center"
);
export const bottombarButtons = cva("flex min-w-0 items-center gap-3");

export const bbStat = cva("text-xs text-fg/60");
export const bbStatStrong = cva("font-mono font-semibold text-fg");

export const autoImportTrigger = cva(
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors hover:text-fg",
  {
    variants: {
      active: {
        true: "border-primary-500/30 bg-primary-500/10 text-fg",
        false: "border-fg/[0.08] bg-fg/[0.03] text-fg/60",
      },
    },
    defaultVariants: { active: false },
  }
);

export const autoImportTriggerLabel = cva("hidden lg:inline");
export const autoImportTriggerIcon = cva("relative inline-flex size-4 items-center justify-center");
export const autoImportTriggerCue = cva(
  "bg-surface absolute -right-1.5 -bottom-1.5 inline-flex items-center justify-center rounded-full p-px"
);

export const autoImportBadge = cva("rounded px-1 font-mono text-[10px]", {
  variants: {
    active: {
      true: "bg-primary-500/20 text-primary-400",
      false: "bg-fg/[0.06] text-fg/50",
    },
  },
  defaultVariants: { active: false },
});

export const autoImportPopover = cva("w-[280px] !max-w-[calc(100vw-2rem)] p-3");
export const autoImportTitle = cva(
  "mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg/50"
);
export const autoImportRow = cva(
  "flex items-center justify-between gap-3 rounded-md border border-transparent px-2 py-1.5 text-xs hover:bg-fg/[0.025]"
);
export const autoImportRowLabel = cva("flex flex-col text-fg");
export const autoImportRowSub = cva("text-[10.5px] text-fg/45");

export const selectionBar = cva(
  "border-fg/10 bg-surface/95 sticky top-0 z-20 mb-2 flex w-full min-w-0 flex-nowrap items-center gap-1.5 rounded-xl border px-3 py-2.5 sm:gap-2 sm:py-2 sm:bg-surface/85 sm:backdrop-blur-md"
);
export const selectionBarChip = cva(
  "border-primary-500/30 bg-primary-500/15 text-fg inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
);
export const selectionBarChipDot = cva("bg-primary-400 size-1.5 rounded-full");
export const selectionBarChipNum = cva("text-primary-400 font-mono font-semibold");
export const selectionBarClear = cva(
  "text-fg/60 hover:bg-fg/5 hover:text-fg ml-auto inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
);
export const selectionBarToggles = cva("flex shrink-0 items-center gap-2 sm:gap-3");
export const selectionBarSyncHint = cva("text-fg/40 hidden text-[10.5px] font-medium sm:inline");

export const triToggle = cva("inline-flex items-center gap-2 text-xs font-medium select-none", {
  variants: {
    disabled: { true: "cursor-not-allowed opacity-50", false: "cursor-pointer" },
  },
  defaultVariants: { disabled: false },
});
export const triToggleGlyph = cva("text-fg/60 size-3.5 shrink-0");
export const triToggleLabel = cva("text-fg/80 hidden sm:inline");
export const triToggleTrack = cva(
  "focus-visible:ring-primary-500/40 relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
  {
    variants: {
      state: {
        on: "bg-primary-500",
        off: "bg-fg/15",
        mixed: "bg-fg/25",
      },
    },
    defaultVariants: { state: "off" },
  }
);
export const triToggleThumb = cva(
  "pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform",
  {
    variants: {
      state: {
        on: "translate-x-[22px]",
        off: "translate-x-0.5",
        mixed: "translate-x-[11px]",
      },
    },
    defaultVariants: { state: "off" },
  }
);
export const triToggleThumbMark = cva("bg-fg/50 h-0.5 w-2 rounded-full");
