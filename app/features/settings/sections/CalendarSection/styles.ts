import { cva } from "class-variance-authority";

export const calendarStack = cva("flex min-w-0 flex-col gap-4");

export const toolbar = cva("flex flex-wrap items-center gap-x-3 gap-y-2");

export const toolbarMonth = cva("text-fg min-w-0 text-lg font-semibold capitalize");

export const toolbarGroup = cva("flex items-center gap-1");

export const toolbarEnd = cva("ms-auto flex flex-wrap items-center gap-2");

export const toolbarButton = cva(
  "text-fg/70 hover:bg-fg/10 hover:text-fg focus-visible:ring-primary-400 inline-flex size-9 cursor-pointer items-center justify-center rounded-lg outline-none focus-visible:ring-2"
);

export const todayButton = cva(
  "text-fg/80 border-fg/15 hover:bg-fg/10 focus-visible:ring-primary-400 inline-flex h-9 cursor-pointer items-center rounded-lg border px-3 text-sm font-medium outline-none focus-visible:ring-2"
);

export const countText = cva("text-fg-muted text-sm");

export const typesStrip = cva("flex flex-wrap items-center gap-2");

export const typesLabel = cva("text-fg/70 text-sm font-medium");

export const typeChip = cva(
  "focus-visible:ring-primary-400 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium outline-none focus-visible:ring-2",
  {
    variants: {
      on: {
        true: "type-text-album border-current/40 bg-current/10",
        false: "text-fg/60 border-fg/15 hover:bg-fg/10",
      },
      locked: { true: "cursor-not-allowed", false: "" },
    },
    defaultVariants: { on: false, locked: false },
  }
);

export const hintText = cva("text-fg-muted text-xs");

export const lastChecked = cva("text-fg-muted inline-flex items-center gap-1 text-xs");

export const gridRoot = cva("border-fg/10 flex min-w-0 flex-col overflow-hidden rounded-xl border");

export const gridHeaderRow = cva("border-fg/10 grid grid-cols-7 border-b");

export const gridHeaderCell = cva("text-fg-muted px-2 py-1.5 text-center text-xs font-medium uppercase");

export const gridWeek = cva("grid grid-cols-7");

export const dayCell = cva(
  "border-fg/10 focus-visible:ring-primary-400 relative flex min-w-0 flex-col gap-1 border-s border-b p-1.5 text-start outline-none first:border-s-0 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset",
  {
    variants: {
      inMonth: { true: "", false: "bg-fg/[0.02] opacity-40" },
      selected: { true: "bg-fg/[0.06]", false: "" },
      compact: { true: "min-h-12 items-center justify-start", false: "min-h-28" },
    },
    defaultVariants: { inMonth: true, selected: false, compact: false },
  }
);

export const dayNumber = cva("inline-flex size-6 items-center justify-center rounded-full text-xs font-medium", {
  variants: {
    today: { true: "bg-primary-500 text-primary-foreground", false: "text-fg/70" },
  },
  defaultVariants: { today: false },
});

export const chipList = cva("flex min-w-0 flex-col gap-0.5");

export const chip = cva(
  "bg-fg/[0.06] hover:bg-fg/10 focus-visible:ring-primary-400 flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md py-0.5 pe-1.5 ps-1 text-start text-xs outline-none focus-visible:ring-2",
  {
    variants: { dim: { true: "text-fg/60", false: "text-fg" } },
    defaultVariants: { dim: false },
  }
);

export const chipAccent = cva("type-text-album h-4 w-0.5 shrink-0 rounded-full bg-current");

export const chipText = cva("min-w-0 flex-1 truncate");

export const chipGlyph = cva("text-fg-muted shrink-0 [&_svg]:size-3");

export const moreButton = cva(
  "text-fg-muted hover:text-fg focus-visible:ring-primary-400 cursor-pointer rounded-md px-1.5 py-0.5 text-start text-xs font-medium outline-none focus-visible:ring-2"
);

export const dotRow = cva("flex items-center gap-0.5");

export const dot = cva("type-text-album size-1.5 rounded-full bg-current");

export const dayPanel = cva("flex w-80 max-w-full flex-col gap-3 p-1");

export const dayPanelTitle = cva("text-fg text-sm font-semibold");

export const releaseCardList = cva("flex flex-col gap-3");

export const releaseCard = cva("flex min-w-0 items-center gap-3");

export const releaseCover = cva("bg-fg/10 relative size-12 shrink-0 overflow-hidden rounded-md");

export const releaseCopy = cva("flex min-w-0 flex-1 flex-col gap-0.5");

export const releaseTitle = cva("text-fg truncate text-sm font-semibold");

export const releaseMeta = cva("text-fg-muted truncate text-xs");

export const releaseActions = cva("flex shrink-0 items-center gap-1");

export const listRoot = cva("flex min-w-0 flex-col");

export const listDayHeader = cva(
  "bg-surface/90 text-fg/70 sticky top-0 z-10 border-b border-fg/10 px-2 py-2 text-xs font-semibold backdrop-blur-sm"
);

export const listRow = cva("hover:bg-fg/[0.04] flex min-w-0 items-center gap-3 px-2 py-2");

export const listColumn = cva("text-fg-muted min-w-0 shrink-0 truncate text-xs", {
  variants: {
    width: { sm: "w-16", md: "w-36", lg: "w-52" },
  },
});

export const listActions = cva("flex shrink-0 items-center justify-end gap-1", {
  variants: {
    layout: { wide: "w-52", medium: "w-24", narrow: "" },
  },
  defaultVariants: { layout: "narrow" },
});

export const statusBox = cva(
  "border-fg/10 flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center"
);

export const placeholderGrid = cva("bg-fg/[0.04] h-96 animate-pulse rounded-xl");

export const srOnly = cva("sr-only");

export const emptyBlock = cva("flex flex-col items-center gap-3");

export const followingBar = cva("flex flex-wrap items-center gap-2");

export const searchBox = cva("min-w-48 flex-1 sm:max-w-xs");

export const summaryText = cva("text-fg-muted text-sm");

export const artistButton = cva(
  "hover:text-fg focus-visible:ring-primary-400 flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-md text-start outline-none focus-visible:ring-2"
);

export const artistAvatar = cva("bg-fg/10 relative size-9 shrink-0 overflow-hidden rounded-full");

export const artistName = cva("text-fg truncate text-sm font-medium");

export const latestCell = cva("flex min-w-0 flex-col");

export const switchCell = cva("flex items-center");

export const pagerRow = cva("pt-2");
