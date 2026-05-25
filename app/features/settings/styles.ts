import { cva } from "class-variance-authority";

export const layoutRoot = cva("flex h-full min-h-0");

export const sidebar = cva(
  "border-fg/10 bg-surface/30 h-full w-full shrink-0 flex-col gap-0.5 overflow-y-auto border-r p-3 md:w-60"
);

export const sidebarFooter = cva("text-fg/40 mt-auto px-3 py-3 font-mono text-[11px]");

export const contentScroll = cva("flex h-full min-h-0 flex-1 flex-col overflow-y-auto");

export const contentRoot = cva("mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:gap-6 sm:p-6 lg:max-w-6xl lg:p-10");

export const sectionGrid = cva("grid grid-cols-1 items-stretch gap-5 sm:gap-6 lg:grid-cols-2");

export const pageTitle = cva("text-fg text-2xl font-semibold");

export const backToSections = cva(
  "text-fg/55 hover:text-fg hover:bg-fg/5 flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:hidden"
);

export const sidebarGroupButton = cva(
  "text-fg/80 hover:bg-fg/5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      active: {
        true: "bg-fg/10 text-fg",
        false: "",
      },
    },
    defaultVariants: { active: false },
  }
);

export const sidebarGroupLabel = cva("flex-1 truncate text-left");

export const sidebarItem = cva(
  "text-fg/60 hover:bg-fg/5 hover:text-fg/90 flex w-full items-center gap-2 rounded-lg py-1.5 pr-3 pl-9 text-sm transition-colors",
  {
    variants: {
      active: {
        true: "bg-primary-500/10 text-fg font-medium",
        false: "",
      },
    },
    defaultVariants: { active: false },
  }
);

export const sidebarGroupHeader = cva("text-fg/40 px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider");

export const settingsCard = cva("border-fg/10 bg-fg/[0.02] flex flex-col gap-4 rounded-2xl border p-4 sm:p-6");

export const cardHeader = cva("flex items-start justify-between gap-3");

export const cardTitle = cva("text-fg text-lg font-semibold");

export const cardDescription = cva("text-fg/60 text-sm");

export const cardDivider = cva("bg-fg/10 -mx-6 my-1 h-px");

export const fieldLabel = cva("text-fg/50 text-[11px] font-semibold uppercase tracking-wider");

export const fieldHelper = cva("text-fg/45 text-xs");

export const fieldRow = cva("flex flex-col gap-1.5");

export const toggleRow = cva("flex items-start justify-between gap-4 sm:gap-6");

export const engineRow = cva("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6");

export const toggleLabel = cva("text-fg text-sm font-medium");

export const toggleDescription = cva("text-fg/55 text-xs");

export const emptyPanel = cva(
  "border-fg/10 bg-fg/5 flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center"
);

export const statusBadge = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", {
  variants: {
    tone: {
      success: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30",
      muted: "bg-fg/5 text-fg/60 ring-1 ring-fg/10",
      warning: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
      danger: "bg-red-500/10 text-red-300 ring-1 ring-red-500/30",
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
  "bg-primary-500/15 text-primary-300 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
);

export const chipsInputInputField = cva(
  "bg-transparent border-0 px-1 py-0 min-w-[8ch] flex-1 focus:ring-0 h-7 text-sm"
);

export const serverPickerCard = cva("border-fg/10 bg-fg/[0.04] flex flex-col gap-2 rounded-xl border p-3");

export const serverPickerButton = cva(
  "border-fg/10 hover:bg-fg/5 flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors"
);

export const memberRow = cva("bg-bg-soft/40 ring-fg/10 flex items-center gap-3 rounded-lg p-3 ring-1");

export const memberAvatar = cva("bg-fg/10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full");

export const segmentedControl = cva("border-fg/15 bg-fg/5 inline-flex rounded-lg border p-0.5");

export const segmentedOption = cva("rounded-md px-3 py-1 text-xs font-medium transition-colors", {
  variants: {
    active: {
      true: "bg-primary-500/20 text-primary-200",
      false: "text-fg/55 hover:text-fg/85",
    },
  },
  defaultVariants: { active: false },
});

export const formattingPreview = cva(
  "border-fg/10 bg-fg/[0.04] text-fg/70 mt-1 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs"
);
