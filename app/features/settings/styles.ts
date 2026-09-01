import { cva } from "class-variance-authority";

export const layoutRoot = cva("flex h-full min-h-0");

export const sidebar = cva(
  "border-fg/10 bg-surface/30 flex h-full w-full shrink-0 flex-col gap-0.5 overflow-y-auto border-r p-3 md:w-60"
);

export const sidebarFooter = cva(
  "text-fg/60 bg-fg/5 ring-fg/10 mt-auto inline-flex w-fit items-center self-start rounded-full px-2.5 py-1 font-mono text-[11px] font-medium ring-1"
);

export const contentScroll = cva("flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto");

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

export const sidebarItem = cva(
  "hover:bg-fg/5 flex w-full items-center gap-2 rounded-lg py-1.5 pr-3 pl-9 text-sm transition-colors",
  {
    variants: {
      active: {
        true: "bg-primary-500/10 text-fg font-medium",
        false: "text-fg/60 hover:text-fg/90",
      },
    },
    defaultVariants: { active: false },
  }
);

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

export const segmentedControl = cva("border-fg/15 bg-fg/5 inline-flex rounded-lg border p-0.5");

export const segmentedOption = cva("rounded-md px-3 py-1 text-xs font-medium transition-colors", {
  variants: {
    active: {
      true: "bg-primary-500/20 text-primary-400",
      false: "text-fg/55 hover:text-fg/85",
    },
  },
  defaultVariants: { active: false },
});

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

export const jobRight = cva("flex shrink-0 items-center gap-3");

export const jobNextRun = cva("flex flex-col items-end gap-0.5 text-right");

export const jobNextRunLabel = cva("text-fg/50 text-[11px] font-semibold uppercase tracking-wider");

export const jobNextRunValue = cva("text-fg text-sm font-medium tabular-nums");

export const jobNextRunUnit = cva("text-fg/55 ml-0.5 text-xs");

export const jobInProgress = cva("text-fg/70 inline-flex items-center gap-1.5 text-sm font-medium");

export const jobPlayButton = cva(
  "border-primary-500/30 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 focus-visible:ring-ring flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-3.5 [&_svg]:shrink-0"
);

export const scanStatGrid = cva("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5");

export const scanStatAction = cva(
  "text-primary-400 focus-visible:ring-primary-500/50 rounded text-lg font-semibold tabular-nums underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
);

export const scanHeaderMeta = cva("text-fg/55 flex items-center gap-2 text-xs whitespace-nowrap");

export const scanStat = cva("border-fg/10 bg-fg/[0.03] flex flex-col items-center gap-0.5 rounded-lg border p-3");

export const scanStatValue = cva("text-fg text-lg font-semibold tabular-nums");

export const scanStatLabel = cva("text-fg/50 text-center text-[11px] font-semibold tracking-wider uppercase");

export const scanMetaRow = cva("text-fg/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs");

export const scanActions = cva("flex flex-wrap items-center gap-2");

export const scanRunLine = cva("text-fg/70 flex items-center gap-2 text-sm");

export const scanUnlinkedList = cva("border-fg/10 flex flex-col gap-1 border-t pt-3");

export const scanUnlinkedItem = cva("text-fg/60 truncate text-xs");

export const scanCopyRow = cva("flex items-center justify-between gap-3");

export const subSection = cva("flex flex-col gap-4 border-t border-fg/10 pt-5");

export const subSectionHeader = cva("flex items-start justify-between gap-3");

export const subSectionHeaderText = cva("flex flex-col gap-0.5");

export const subSectionTitle = cva("text-fg text-sm font-semibold");

export const subSectionDescription = cva("text-fg/60 text-xs");

export const copyRow = cva("flex items-stretch gap-2");

export const dupTabs = cva("border-fg/10 flex gap-6 overflow-x-auto border-b");

export const dupTab = cva(
  "flex items-center gap-2 border-b-2 py-2.5 text-[13.5px] font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:outline-none",
  {
    variants: {
      active: {
        true: "text-fg border-primary-500",
        false: "text-fg/55 hover:text-fg/80 border-transparent",
      },
    },
    defaultVariants: { active: false },
  }
);

export const dupTabCount = cva("rounded-full bg-current/15 px-1.5 py-0.5 text-[11px] font-bold");

export const dupBanner = cva("flex flex-wrap gap-3.5 rounded-xl border p-4", {
  variants: {
    tone: {
      safe: "text-success-vivid border-current/25 bg-current/10 items-center",
      review: "text-warning-vivid border-current/25 bg-current/10 items-start",
    },
  },
  defaultVariants: { tone: "safe" },
});

export const dupBannerFigure = cva("text-[22px] font-extrabold tracking-tight");

export const dupBannerTitle = cva("text-[13.5px] font-semibold");

export const dupBannerNote = cva("text-fg/55 text-[12.5px] leading-relaxed");

export const dupScroll = cva("flex max-h-[420px] flex-col gap-2 overflow-y-auto pt-3");

export const dupCard = cva("border-fg/10 bg-fg/[0.02] shrink-0 overflow-hidden rounded-xl border");

export const dupCardHead = cva("flex items-center gap-3.5 p-3");

export const dupCaret = cva(
  "text-fg/50 hover:text-fg shrink-0 rounded p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:outline-none"
);

export const dupTrackTitle = cva("text-fg truncate text-sm font-semibold");

export const dupTrackMeta = cva("text-fg/55 truncate text-xs");

export const dupReclaim = cva("hidden shrink-0 text-sm font-bold tabular-nums sm:block");

export const dupFiles = cva("border-fg/10 flex flex-col gap-0.5 border-t px-3.5 pt-2.5 pb-3");

export const dupDir = cva("text-fg/45 pt-0.5 pb-1.5 font-mono text-[11px] break-all");

export const dupFileRow = cva("flex items-center gap-2.5 rounded-lg px-2 py-1.5", {
  variants: { serving: { true: "bg-primary-500/10", false: "even:bg-fg/[0.03]" } },
  defaultVariants: { serving: false },
});

export const dupServingBadge = cva(
  "text-success-vivid bg-current/15 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap"
);

export const dupFileName = cva("min-w-0 flex-1 font-mono text-xs break-all");

export const dupFileLength = cva("text-fg/70 shrink-0 font-mono text-[11.5px] tabular-nums");

export const dupFileSize = cva("text-fg/50 hidden shrink-0 font-mono text-[11.5px] tabular-nums sm:block");

export const dupPlay = cva(
  "text-fg/60 hover:text-fg hover:bg-fg/10 focus-visible:ring-primary-500/50 shrink-0 rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
);

export const dupKeepThis = cva(
  "text-primary-400 hover:bg-primary-500/10 focus-visible:ring-primary-500/50 flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
);

export const binToggle = cva(
  "text-fg/70 hover:text-fg flex items-center gap-1.5 text-sm font-semibold transition-colors"
);

export const binRow = cva("border-fg/10 bg-fg/[0.02] flex items-start gap-3 rounded-lg border px-3 py-2.5");

export const binFileName = cva("text-fg/85 font-mono text-[12.5px] break-all");

export const binDir = cva("text-fg/45 font-mono text-[11px] break-all");

export const binRowMeta = cva("text-fg/50 font-mono text-[11px] tabular-nums");

export const binRestore = cva(
  "text-primary-400 hover:text-primary-300 mt-0.5 focus-visible:ring-primary-500/50 inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-1 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
);
