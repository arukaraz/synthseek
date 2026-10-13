import { cva } from "class-variance-authority";

export const modalRoot = cva(
  [
    "!flex w-full flex-col gap-0 overflow-hidden p-0 shadow-2xl",
    "h-[100dvh] !max-h-[100dvh] !rounded-none !top-0 !left-0 !translate-x-0",
    "sm:!top-[50%] sm:!left-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%]",
    "sm:h-[min(90vh,880px)] sm:!max-h-[90vh] sm:max-w-5xl sm:!rounded-2xl",
  ].join(" ")
);

export const panelGrid = cva(
  "grid h-full min-h-0 w-full min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto_auto_minmax(0,1fr)_auto]"
);

export const listSlot = cva("h-full min-h-0", {
  variants: {
    visible: { true: "block", false: "hidden" },
  },
  defaultVariants: { visible: true },
});

export const stepGrid = cva(
  "grid h-full min-h-0 w-full min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto_minmax(0,1fr)_auto]"
);

export const panelHeader = cva("flex items-start gap-3 px-4 pt-4 pb-3 pr-14 sm:px-6 sm:pt-6");

export const panelHeaderText = cva("flex min-w-0 flex-1 flex-col gap-1");

export const panelDescription = cva("text-fg/60 text-sm");

export const panelPath = cva("text-fg/50 text-xs break-all");

export const panelTabs = cva("px-4 sm:px-6");

export const panelTools = cva("flex flex-col gap-2 px-4 pt-3 pb-2 sm:px-6");

export const toolRow = cva("flex flex-wrap items-center gap-2");

export const toolField = cva("min-w-0 flex-1 basis-48");

export const panelBody = cva("min-h-0 overflow-y-auto px-4 pb-3 sm:px-6");

export const panelFooter = cva("border-fg/10 flex flex-col gap-2 border-t px-4 py-3 sm:px-6");

export const footerActions = cva("flex flex-wrap items-center justify-between gap-3");

export const footerButtons = cva("ml-auto flex flex-wrap items-center gap-2");

export const footerNote = cva("text-fg/55 text-xs");

export const groupList = cva(
  "border-fg/10 bg-surface/40 flex flex-col rounded-xl border [&_li[data-range-preview=clear]]:bg-fg/10 [&_li[data-range-preview=select]]:bg-primary-500/10"
);

export const groupRow = cva(
  "border-fg/10 grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 border-b px-3 py-3 last:border-b-0 sm:grid-cols-[1.25rem_2.75rem_minmax(0,1fr)_auto] sm:px-4",
  {
    variants: {
      selected: { true: "bg-fg/5", false: "" },
    },
    defaultVariants: { selected: false },
  }
);

export const selectCell = cva("hidden items-center sm:flex");

export const groupThumb = cva(
  "bg-fg/5 text-fg/50 flex size-9 items-center justify-center rounded-lg sm:size-11 [&_svg]:size-4"
);

export const groupInfo = cva("flex min-w-0 flex-col gap-0.5");

export const groupTitle = cva("text-fg truncate text-sm font-medium");

export const groupMeta = cva("text-fg/55 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs", {
  variants: {
    busy: { true: "text-primary-400", false: "" },
  },
  defaultVariants: { busy: false },
});

export const filesToggle = cva(
  "text-fg hover:text-primary-400 inline-flex items-center gap-0.5 text-xs font-medium underline decoration-fg/20 underline-offset-4 transition-colors [&_svg]:size-3.5"
);

export const rowActions = cva("flex items-center gap-1.5");

export const desktopOnly = cva("hidden sm:inline-flex");

export const busyChip = cva(
  "border-primary-500/40 text-primary-400 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium [&_svg]:size-3.5"
);

export const fileList = cva(
  "border-fg/10 bg-fg/[0.02] col-span-full mt-3 flex flex-col rounded-lg border sm:col-start-2"
);

export const fileRow = cva(
  "border-fg/10 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 border-b py-3 pr-1.5 pl-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_3rem_auto] sm:items-center sm:py-2"
);

export const fileMain = cva("flex min-w-0 flex-col gap-1 sm:gap-0.5");

export const fileTitle = cva("text-fg line-clamp-2 text-sm font-medium sm:truncate sm:text-[13px]");

export const filePath = cva("text-fg/50 truncate font-mono text-[11px]");

export const fileLengthMobile = cva("text-fg/50 text-xs tabular-nums sm:hidden");

export const fileLength = cva("text-fg/50 hidden text-right text-xs tabular-nums sm:block");

export const showMoreRow = cva("border-fg/10 border-t px-3 py-2");

export const menuTrigger = cva(
  "text-fg/60 hover:bg-fg/10 hover:text-fg flex size-8 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4"
);

export const menuContent = cva("w-72 max-w-[calc(100vw-2rem)]");

export const menuItem = cva("items-start");

export const menuItemText = cva("flex min-w-0 flex-col gap-0.5");

export const menuItemHelp = cva("text-fg/50 text-xs leading-snug whitespace-normal");

export const emptyBox = cva("py-10");

export const centered = cva("flex justify-center py-10");

export const errorText = cva("text-destructive-vivid py-6 text-center text-sm");

export const resultList = cva("flex flex-col gap-1");

export const resultRow = cva(
  "grid w-full cursor-pointer grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors sm:grid-cols-[2.5rem_minmax(0,1fr)_auto_auto]",
  {
    variants: {
      picked: {
        true: "border-primary-500/60 bg-primary-500/10",
        false: "hover:bg-fg/5 border-transparent",
      },
    },
    defaultVariants: { picked: false },
  }
);

export const resultThumb = cva("size-10 shrink-0 overflow-hidden rounded-md");

export const resultImage = cva("size-full object-cover");

export const resultLine = cva("text-fg/55 flex flex-wrap gap-x-2 text-xs");

export const resultHint = cva("text-primary-400 text-xs font-medium");

export const resultLength = cva("text-fg/50 hidden text-xs whitespace-nowrap tabular-nums sm:block");

export const chip = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        ok: "text-success-vivid border-current/40",
        warn: "text-warning-vivid border-current/40",
        bad: "text-destructive-vivid border-current/40",
        neutral: "text-fg/55 border-fg/15",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export const mappingTable = cva("border-fg/10 bg-surface/40 mt-3 flex flex-col rounded-xl border");

export const mappingRow = cva(
  "border-fg/10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b p-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_3.25rem_minmax(0,18rem)_7.5rem] sm:gap-3"
);

export const mappingHead = cva(
  "border-fg/10 text-fg/50 hidden grid-cols-[minmax(0,1fr)_3.25rem_minmax(0,18rem)_7.5rem] gap-3 border-b px-3 py-2 text-[11px] font-semibold tracking-wider uppercase sm:grid"
);

export const mappingFile = cva("text-fg col-span-full truncate font-mono text-[11px] sm:col-span-1");

export const mappingLength = cva("text-fg/50 hidden text-xs tabular-nums sm:block");

export const mappingSelect = cva(
  "border-fg/15 bg-surface text-fg focus-visible:ring-primary-400 h-9 w-full min-w-0 rounded-lg border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
);

export const noticeStack = cva("mt-3 flex flex-col gap-2");

export const checkLabel = cva("text-fg flex cursor-pointer items-center gap-2 text-sm");
