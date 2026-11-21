import { cva } from "class-variance-authority";

export const cssModeGrid = cva("grid items-start gap-4 md:gap-5", {
  variants: {
    side: {
      true: "md:grid-cols-[12.5rem_minmax(0,1fr)] md:gap-4",
      false: "md:grid-cols-[13.75rem_minmax(0,1fr)]",
    },
  },
  defaultVariants: { side: false },
});

export const editorColumn = cva("grid min-w-0 gap-2.5", {
  variants: {
    side: {
      true: "xl:grid-cols-[minmax(0,1fr)_15.5rem] xl:items-start xl:gap-4",
      false: "",
    },
  },
  defaultVariants: { side: false },
});

export const treeColumn = cva("flex min-w-0 flex-col gap-2");
export const phoneBar = cva("flex min-w-0 items-center gap-2 md:hidden");
export const phoneSelect = cva("min-w-0 flex-1 font-mono text-xs");
export const treeRoot = cva("hidden flex-col gap-px font-mono text-xs md:flex");
export const treeRootLabel = cva("px-1.5 pb-1.5 pt-0.5 text-fg break-words");
export const treeDirectory = cva("px-1.5 pb-0.5 pt-1.5 text-fg-muted");
export const treeEmpty = cva("py-1 pl-[1.125rem] text-fg-muted opacity-60");
export const treeLine = cva("flex items-center gap-0.5");

export const treeRow = cva(
  "flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-1.5 rounded-md py-1 pr-1.5 text-left transition-colors",
  {
    variants: {
      top: { true: "pl-1.5", false: "pl-[1.125rem]" },
      current: { true: "bg-surface-overlay", false: "" },
      broken: { true: "text-destructive-vivid", false: "" },
    },
    compoundVariants: [
      { current: true, broken: false, className: "text-fg" },
      { current: false, broken: false, className: "text-fg-muted hover:text-fg" },
    ],
    defaultVariants: { top: false, current: false, broken: false },
  }
);

export const treeLabel = cva("truncate");
export const dirtyDot = cva("size-1.5 shrink-0 rounded-full bg-warning-vivid");

export const newFileToggle = cva(
  "flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs text-fg-muted transition-colors hover:text-fg"
);
export const newFileForm = cva("flex flex-col gap-1.5 px-1.5");
export const newFileRow = cva("flex items-center gap-1.5");
export const newFileSuffix = cva("font-mono text-xs text-fg-muted");
export const newFileHint = cva("text-xs", {
  variants: { bad: { true: "text-destructive-vivid", false: "text-fg-muted" } },
  defaultVariants: { bad: false },
});

export const codeFrame = cva("overflow-hidden rounded-lg border border-border bg-surface-sunken");
export const codeHead = cva(
  "flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-border py-1.5 pl-3 pr-2 text-xs"
);
export const codePath = cva("min-w-0 flex-1 font-mono text-fg break-words");
export const codeBody = cva("h-[21rem]");
export const codeHost = cva("h-full min-w-0");
export const readonlyBody = cva("h-[21rem] overflow-auto p-3 text-xs");
export const readonlyJsonText = cva("font-mono whitespace-pre text-fg");
export const readonlyNote = cva("mt-3 text-fg-muted");

export const chip = cva(
  "cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs transition-colors",
  {
    variants: {
      pressed: {
        true: "border-primary-500 bg-primary-500/15 text-fg",
        false: "border-border text-fg-muted hover:text-fg",
      },
    },
    defaultVariants: { pressed: false },
  }
);

export const problemsBox = cva("flex flex-col gap-0.5 border-t border-border px-2.5 py-1.5 text-xs");
export const problemButton = cva(
  "flex cursor-pointer gap-2 py-0.5 text-left text-fg-muted transition-colors hover:text-fg"
);
export const problemLine = cva("whitespace-nowrap", {
  variants: { severity: { error: "text-destructive-vivid", warning: "text-warning-vivid" } },
  defaultVariants: { severity: "error" },
});
export const problemMore = cva("text-fg-muted");

export const codeFoot = cva("flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3 py-1.5 text-xs");
export const docLink = cva("text-primary-400 underline-offset-2 hover:underline");
export const footSpacer = cva("flex-1");
export const statusError = cva("text-destructive-vivid");
export const statusWarning = cva("text-warning-vivid");
export const statusText = cva("text-fg-muted");

export const diskBanner = cva(
  "flex flex-wrap items-center gap-2 rounded-lg border border-warning-vivid/40 bg-warning-vivid/10 px-3 py-2 text-xs text-fg"
);
export const diskText = cva("min-w-0 flex-1");

export const sidePanel = cva("flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-surface-sunken p-2.5");
export const insertPanel = cva("max-h-[29rem]");
export const chipRow = cva("flex w-max gap-1");
export const insertList = cva("flex min-h-0 flex-col gap-px overflow-auto");
export const insertItem = cva(
  "grid cursor-pointer grid-cols-[0.75rem_minmax(0,1fr)] items-center gap-2 rounded-md p-1.5 text-left text-xs transition-colors hover:bg-surface-overlay"
);
export const insertSwatch = cva("size-3 rounded-sm border border-border", {
  variants: { empty: { true: "invisible", false: "" } },
  defaultVariants: { empty: false },
});
export const insertMeta = cva("flex min-w-0 flex-col");
export const insertKey = cva("truncate font-mono text-fg");
export const insertDescription = cva("truncate text-fg-muted");
export const insertHint = cva("text-xs text-fg-muted");
export const insertNothing = cva("py-2 text-xs text-fg-muted");

export const historyPanel = cva("max-h-[29rem] overflow-auto");
export const historyHead = cva("flex items-center gap-1.5");
export const historyTitle = cva("text-sm font-semibold text-fg");
export const historyPath = cva("mt-1 font-mono text-xs text-fg-muted break-words");
export const historySeparator = cva("my-2.5 w-full border-0 border-t border-border");
export const historyList = cva("flex flex-col");
export const historyRow = cva(
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 border-t border-border/70 py-1.5 text-xs first:border-t-0"
);
export const historyWhen = cva("flex flex-wrap items-baseline gap-x-2 tabular-nums text-fg");
export const historyNow = cva("text-xs text-success-vivid");
export const historySource = cva("col-start-1 text-fg-muted break-words");
export const historyAction = cva("col-start-2 row-span-2 row-start-1");
export const historyEmpty = cva("pt-2 text-xs text-fg-muted");
