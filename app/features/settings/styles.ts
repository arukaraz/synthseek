import { cva } from "class-variance-authority";

export const layoutRoot = cva("flex h-full min-h-0");

export const sidebar = cva(
  "border-fg/10 bg-surface/30 flex h-full w-full shrink-0 flex-col gap-0.5 overflow-y-auto border-r p-3 md:w-60"
);

export const sidebarFooter = cva(
  "text-fg/60 bg-fg/5 ring-fg/10 mt-10.5 inline-flex w-fit items-center self-start rounded-full px-2.5 py-1 font-mono text-[11px] font-medium ring-1"
);

export const sidebarBottom = cva("mt-auto flex flex-col gap-2 pt-4");

export const contentScroll = cva("flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto");

export const pageColumn = cva("flex min-w-0 flex-col");

export const contentRoot = cva("mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:max-w-6xl lg:p-10");

export const sectionGrid = cva("grid grid-cols-1 items-stretch gap-5 sm:gap-6 lg:grid-cols-2");

export const pageTitle = cva("text-fg text-2xl font-semibold");

export const backToSections = cva(
  "text-fg/55 hover:text-fg hover:bg-fg/5 flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:hidden"
);

export const sidebarGroupButton = cva(
  "hover:bg-fg/5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      active: {
        true: "bg-fg/10 text-fg",
        false: "text-fg/80",
      },
    },
    defaultVariants: { active: false },
  }
);

export const sidebarGroupLabel = cva("flex-1 truncate text-left");

export const sidebarGroupHeader = cva("text-fg/40 px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider");

export const settingsCard = cva("border-fg/10 bg-fg/[0.02] flex flex-col gap-4 rounded-2xl border p-4 sm:p-6");

export const cardHeader = cva("flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap");

export const cardHeaderText = cva("flex min-w-0 flex-1 flex-col gap-1");

export const cardHeaderTrailing = cva("w-full shrink-0 sm:w-auto");

export const cardTitle = cva("text-fg text-lg font-semibold");

export const cardDescription = cva("text-fg/60 text-sm");

export const cardDivider = cva("bg-fg/10 -mx-4 my-1 h-px sm:-mx-6");

export const cardSectionHeader = cva("text-fg/70 text-sm font-semibold");

export const fieldLabel = cva("text-fg/50 text-[11px] font-semibold uppercase tracking-wider");

export const fieldLabelRow = cva("flex items-center gap-1.5");

export const fieldHelper = cva("text-fg/45 text-xs");

export const fieldError = cva("text-red-400 text-xs");

export const fieldWarning = cva("text-amber-400 text-xs");

export const fieldRow = cva("flex flex-col", {
  variants: {
    spacing: {
      default: "gap-1.5",
      loose: "gap-3",
    },
  },
  defaultVariants: { spacing: "default" },
});

export const engineRow = cva("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6");

export const emptyPanel = cva(
  "border-fg/10 bg-fg/5 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center"
);

export const pill = cva(
  "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
  {
    variants: {
      tone: {
        experimental: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
        info: "bg-primary-500/15 text-primary-400 ring-1 ring-primary-500/30",
        success: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
        danger: "bg-red-500/15 text-red-300 ring-1 ring-red-500/30",
        muted: "bg-fg/10 text-fg/60 ring-fg/10 ring-1",
      },
    },
    defaultVariants: { tone: "muted" },
  }
);

export const statusBadge = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      tone: {
        success: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
        muted: "bg-fg/5 text-fg/60 ring-1 ring-fg/10",
        warning: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
        danger: "bg-red-500/10 text-red-300 ring-1 ring-red-500/30",
      },
    },
    defaultVariants: { tone: "muted" },
  }
);

export const statusSupportingText = cva("text-fg/55 text-xs sm:max-w-56");

export const statusDot = cva("inline-block size-1.5 rounded-full", {
  variants: {
    tone: {
      success: "bg-emerald-400",
      muted: "bg-fg/40",
      warning: "bg-amber-400",
      danger: "bg-red-400",
    },
  },
  defaultVariants: { tone: "muted" },
});

export const saveBar = cva(
  "border-fg/10 bg-surface/80 sticky bottom-0 -mx-6 mt-2 flex items-center justify-end gap-3 border-t px-6 py-3 backdrop-blur"
);

export const chipsInputRoot = cva(
  "border-fg/15 bg-fg/5 flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors focus-within:border-primary-500/50 focus-within:ring-primary-500/30 focus-within:ring-2"
);

export const chipsInputChip = cva(
  "bg-primary-500/15 text-primary-400 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
);

export const chipsInputInputField = cva(
  "bg-transparent border-0 px-1 py-0 min-w-[8ch] flex-1 focus:ring-0 h-7 text-sm"
);

export const serverPickerCard = cva("border-fg/10 bg-fg/[0.04] flex flex-col gap-2 rounded-xl border p-3");

export const serverPickerButton = cva(
  "border-fg/10 hover:bg-fg/5 hover:border-fg/20 group flex w-full min-w-0 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors"
);

export const serverPickerName = cva("text-fg truncate text-sm font-medium");

export const serverPickerUri = cva("text-fg/45 truncate font-mono text-[11px]");

export const serverPickerLocationBadge = cva(
  "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
  {
    variants: {
      local: {
        true: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
        false: "bg-fg/10 text-fg/55 ring-fg/10 ring-1",
      },
    },
    defaultVariants: { local: false },
  }
);

export const memberAvatar = cva("bg-fg/10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full");

export const formattingPreview = cva(
  "border-fg/10 bg-fg/[0.04] text-fg/70 mt-1 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs"
);

export const integrationTabsBar = cva(
  "border-fg/10 bg-surface/80 sticky top-0 z-10 -mx-4 flex h-11 gap-1 overflow-x-auto overflow-y-hidden border-b px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
);

export const integrationTab = cva(
  "relative flex h-10 shrink-0 items-center gap-2 px-3 text-sm font-medium transition-colors",
  {
    variants: {
      active: {
        true: "text-fg",
        false: "text-fg/55 hover:text-fg/85",
      },
    },
    defaultVariants: { active: false },
  }
);

export const integrationTabUnderline = cva("absolute -bottom-px left-2 right-2 h-[2px] rounded-full bg-primary-500");

export const integrationTabCount = cva(
  "bg-fg/10 text-fg/70 rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums"
);

export const listManagerCount = cva("text-fg/45 text-[11px] font-semibold uppercase tracking-wider");

export const listManagerAddRow = cva("flex items-center gap-2");

export const listManagerListWrap = cva(
  "border-fg/10 bg-fg/[0.02] flex max-h-64 min-h-[3rem] flex-col overflow-y-auto rounded-lg border"
);

export const listManagerRow = cva(
  "border-fg/5 group flex items-center justify-between gap-2 border-b px-3 py-1.5 text-sm last:border-b-0"
);

export const listManagerRemove = cva(
  "text-fg/40 hover:text-red-300 hover:bg-red-500/10 flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
);

export const listManagerEmpty = cva("text-fg/40 px-3 py-4 text-center text-xs");

export const listManagerFilterIcon = cva(
  "text-fg/40 pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2"
);

export const jobList = cva("flex flex-col");

export const jobRow = cva(
  "border-fg/10 flex items-center justify-between gap-4 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0"
);

export const jobInfo = cva("flex min-w-0 flex-col gap-0.5");

export const jobName = cva("text-fg text-sm font-medium");

export const jobDescription = cva("text-fg/55 text-xs");

export const jobProgress = cva("text-fg/40 text-xs tabular-nums");

export const jobSkipped = cva("ms-1.5 inline-flex items-center gap-1 align-middle");

export const jobRight = cva("flex shrink-0 items-center gap-3");

export const jobNextRun = cva("flex flex-col items-end gap-0.5 text-right");

export const jobNextRunLabel = cva("text-fg/50 text-[11px] font-semibold uppercase tracking-wider");

export const jobNextRunValue = cva("text-fg text-sm font-medium tabular-nums");

export const jobNextRunUnit = cva("text-fg/55 ml-0.5 text-xs");

export const jobInProgress = cva("text-fg/70 inline-flex items-center gap-1.5 text-sm font-medium");

export const jobLastRunFailed = cva("text-destructive-vivid text-sm font-medium");

export const jobPlayButton = cva(
  "focus-visible:ring-ring flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      intent: {
        run: "border-primary-500/30 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20",
        stop: "text-primary-400 hover:text-fg border-transparent bg-transparent [&_svg]:size-3",
      },
    },
    defaultVariants: { intent: "run" },
  }
);

export const jobAction = cva("relative flex shrink-0");

export const scanHeaderMeta = cva("text-fg/55 flex items-center gap-2 text-xs whitespace-nowrap");

export const scanFooter = cva("text-fg/50 text-xs");

export const scanFooterLink = cva("hover:text-fg underline-offset-4 transition-colors hover:underline");

export const scanFooterRow = cva("flex flex-wrap items-center justify-between gap-2");

export const scanPathCell = cva("flex min-w-0 flex-col gap-0.5");

export const scanPathLabel = cva("text-fg truncate text-sm font-medium");

export const scanPathFolder = cva("text-fg/50 truncate font-mono text-xs");

export const scanCount = cva("text-sm tabular-nums", {
  variants: {
    tone: {
      plain: "text-fg/80",
      attention: "text-warning-vivid font-semibold",
      danger: "text-destructive-vivid font-semibold",
    },
  },
  defaultVariants: { tone: "plain" },
});

export const scanLastRun = cva("text-xs whitespace-nowrap", {
  variants: {
    skipped: { true: "text-warning-vivid", false: "text-fg/55" },
  },
  defaultVariants: { skipped: false },
});

export const scanMetaRow = cva("text-fg/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs");

export const namingTokenList = cva("grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3");

export const namingToken = cva("flex items-baseline gap-2 text-xs");

export const namingTokenName = cva("text-fg/70 shrink-0 font-mono");

export const namingTokenMeaning = cva("text-fg/50");

export const namingHint = cva("text-fg/60 text-xs");

export const namingSampleList = cva("text-fg/60 flex flex-col gap-1 text-xs");

export const scanActions = cva("flex flex-wrap items-center gap-2");

export const scanRunLine = cva("text-fg/70 flex items-center gap-2 text-sm");

export const scanUnlinkedList = cva("border-fg/10 flex flex-col gap-1 border-t pt-3");

export const scanUnlinkedItem = cva("text-fg/60 truncate text-xs");

export const scanCopyRow = cva("flex items-center justify-between gap-3");

export const copyRow = cva("flex items-stretch gap-2");

export const dupComparing = cva("text-fg/55 flex items-center gap-2 pb-3 text-[12.5px]");

export const dupScroll = cva("flex flex-col gap-2");

export const dupCard = cva("border-fg/10 bg-fg/[0.02] shrink-0 overflow-hidden rounded-xl border");

export const dupCardHead = cva(
  "hover:bg-fg/[0.03] focus-visible:ring-primary-500/50 flex w-full items-center gap-3 p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
);

export const dupCaret = cva("text-fg/50 shrink-0 transition-transform", {
  variants: { open: { true: "rotate-90", false: "" } },
  defaultVariants: { open: false },
});

export const dupTrackTitle = cva("text-fg truncate text-sm font-semibold");

export const dupTrackMeta = cva("text-fg/55 truncate text-xs");

export const dupListenPill = cva(
  "text-warning-vivid bg-current/12 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
);

export const dupReclaim = cva("hidden shrink-0 text-sm font-bold tabular-nums sm:block");

export const dupBody = cva("border-fg/10 flex flex-col gap-3 border-t p-3.5");

export const dupTransport = cva("flex flex-wrap items-center gap-x-4 gap-y-2");

export const dupPlayButton = cva("size-9 shrink-0 rounded-full");

export const dupClock = cva("text-fg/60 font-mono text-xs tabular-nums");

export const dupClockNow = cva("text-fg font-semibold");

export const dupOption = cva("text-fg/75 flex items-center gap-2 text-[12.5px] font-medium");

export const dupRuler = cva(
  "text-fg/55 border-fg/15 bg-fg/[0.07] focus-visible:ring-primary-500/50 relative ml-11 flex h-7 cursor-pointer items-center justify-between rounded-md border font-mono text-[10.5px] tabular-nums select-none focus-visible:ring-2 focus-visible:outline-none [&>span]:px-2"
);

export const dupLane = cva("flex items-start gap-2");

export const dupLaneToggle = cva(
  "focus-visible:ring-primary-500/50 mt-3 flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      on: {
        true: "border-primary-500 bg-primary-500/15 text-primary-400",
        false:
          "border-fg/15 text-fg/45 hover:text-fg/75 disabled:text-fg/25 disabled:cursor-not-allowed disabled:hover:text-fg/25",
      },
    },
    defaultVariants: { on: false },
  }
);

export const dupLaneBox = cva("flex min-w-0 flex-1 flex-col gap-1");

export const dupTrack = cva("bg-fg/[0.03] relative h-16 cursor-pointer overflow-hidden rounded-lg select-none");

export const dupWave = cva("absolute inset-y-0 h-full", {
  variants: { on: { true: "text-primary-400/80", false: "text-fg/25" } },
  defaultVariants: { on: false },
});

export const dupLoopBand = cva("bg-primary-400/15 border-primary-400 absolute inset-y-0 border-x-2");

export const dupTimeline = cva("relative isolate flex flex-col gap-3");

export const dupPlayheadLayer = cva("pointer-events-none absolute inset-y-0 right-0 left-11 z-10");

export const dupPlayhead = cva("bg-fg absolute inset-y-0 w-px");

export const dupDiffStrip = cva("bg-fg/[0.05] relative h-1.5 overflow-hidden rounded-full");

export const dupDiffSpan = cva("bg-destructive-vivid/70 absolute inset-y-0");

export const dupMetaRow = cva("flex items-center gap-2.5");

export const dupMetaLine = cva("flex min-w-0 flex-1 items-center gap-2");

export const dupFormat = cva(
  "text-fg/75 bg-fg/10 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10.5px] font-bold uppercase"
);

export const dupStat = cva("text-fg shrink-0 text-xs font-semibold tabular-nums");

export const dupStateBadge = cva(
  "bg-current/15 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap",
  {
    variants: { tone: { success: "text-success-vivid", destructive: "text-destructive-vivid" } },
    defaultVariants: { tone: "success" },
  }
);

export const dupPathBadge = cva(
  "text-fg/70 bg-fg/10 shrink-0 truncate rounded-full px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap"
);

export const dupFileName = cva("text-fg/50 border-fg/15 min-w-0 truncate border-l pl-2 font-mono text-[11.5px]");

export const dupFooter = cva("flex justify-end");

export const dupRejectOptions = cva("mt-3 grid gap-3 sm:grid-cols-2");

export const dupRejectOption = cva("border-fg/10 flex flex-col gap-3 rounded-xl border p-4");

export const dupRejectHeading = cva("text-fg text-sm font-semibold");

export const dupRejectList = cva(
  "text-fg/65 flex flex-1 list-disc flex-col gap-1.5 pl-4 text-[12.5px] leading-relaxed"
);

export const binToggle = cva(
  "text-fg/70 hover:text-fg flex items-center gap-1.5 text-sm font-semibold transition-colors"
);

export const binRow = cva("border-fg/10 bg-fg/[0.02] flex items-start gap-3 rounded-lg border px-3 py-2.5");

export const binFileName = cva("text-fg/85 font-mono text-[12.5px] break-all");

export const binDir = cva("text-fg/45 font-mono text-[11px] break-all");

export const binRowMeta = cva("text-fg/50 font-mono text-[11px] tabular-nums");

export const binRestore = cva(
  "text-primary-400 hover:text-primary-500 mt-0.5 focus-visible:ring-primary-500/50 inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-1 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
);
