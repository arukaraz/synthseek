import { cva } from "class-variance-authority";

export const workshopRoot = cva("flex min-h-0 flex-1 flex-col");

export const workshopHeader = cva(
  "border-fg/10 flex flex-wrap items-center gap-3 border-b px-4 pt-4 pr-14 pb-3 sm:pt-6 sm:pr-16 sm:pl-6"
);

export const workshopHeading = cva("flex min-w-0 flex-1 flex-col gap-0.5");

export const workshopTitle = cva("text-fg min-w-0 truncate text-base font-semibold");

export const workshopSubtitle = cva("text-fg/60 text-xs");

export const workshopScroll = cva("min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-6 sm:px-6");

export const workshopLayout = cva("grid items-start gap-6 min-[980px]:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]");

export const workshopForm = cva("@container flex min-w-0 flex-col gap-5");

export const workshopAside = cva(
  "flex min-w-0 flex-col gap-2 min-[980px]:sticky min-[980px]:top-0 min-[980px]:order-last"
);

export const section = cva("border-fg/10 bg-fg/[0.02] flex flex-col gap-3 rounded-2xl border p-4");

export const sectionHead = cva("flex flex-wrap items-center gap-x-3 gap-y-2");

export const sectionNumber = cva(
  "bg-primary-500/15 text-primary-400 flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
);

export const sectionTitle = cva("text-fg text-sm font-semibold");

export const sectionHelp = cva("text-fg/60 text-xs");

export const kindSwitch = cva("ml-auto flex items-center gap-2");

export const kindLabel = cva("text-fg/60 text-xs");

export const startFromRow = cva("flex min-w-0 items-center gap-3");

export const startFromLabel = cva("text-fg/60 shrink-0 font-mono text-[10.5px] tracking-wider uppercase");

export const startFromList = cva("flex gap-2 whitespace-nowrap");

export const presetChip = cva(
  "border-fg/15 text-fg hover:border-primary-400/60 focus-visible:ring-primary-400 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 [&_svg]:size-3.5"
);

export const stepList = cva("border-fg/10 flex flex-col divide-y divide-fg/10 overflow-hidden rounded-xl border");

export const stepRow = cva(
  "grid grid-cols-[minmax(0,1fr)_30px] items-start gap-x-3 gap-y-1.5 px-3 py-2.5 @[28rem]:grid-cols-[92px_minmax(0,1fr)_30px]"
);

export const stepLabel = cva(
  "text-fg/60 col-start-1 row-start-1 pt-3 font-mono text-[10.5px] font-semibold tracking-wider uppercase"
);

export const stepControls = cva(
  "col-span-2 row-start-2 flex min-w-0 flex-wrap items-center gap-2 @[28rem]:col-span-1 @[28rem]:col-start-2 @[28rem]:row-start-1 [&>button]:w-auto [&>button]:max-w-full"
);

export const stepRemove = cva("col-start-2 row-start-1 justify-self-end @[28rem]:col-start-3");

export const stepText = cva("text-fg/70 text-sm");

export const addRow = cva("bg-fg/[0.03] flex flex-wrap gap-2 px-3 py-2.5 @[28rem]:pl-[calc(92px+1.5rem)]");

export const readback = cva("border-primary-400 bg-fg/[0.03] text-fg/80 rounded-r-lg border-l-2 px-3 py-2 text-sm");

export const numberInput = cva("w-20 tabular-nums");

export const ruleList = cva("flex min-w-0 flex-1 flex-col gap-1.5");

export const ruleMatch = cva("text-fg/70 flex flex-wrap items-center gap-2 text-xs [&>button]:w-auto");

export const ruleAdd = cva("self-start");

export const ruleRow = cva("flex min-w-0 items-center gap-2");

export const ruleTextButton = cva(
  "text-fg hover:bg-fg/5 focus-visible:ring-primary-400 min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-sm outline-none focus-visible:ring-2"
);

export const ruleEditor = cva("border-primary-400/40 bg-fg/[0.03] flex flex-col gap-2 rounded-lg border p-2");

export const ruleEditorControls = cva(
  "flex min-w-0 flex-wrap items-center gap-2 [&>button]:w-auto [&>button]:max-w-full"
);

export const ruleEditorActions = cva("flex justify-end gap-2");

export const viewGrid = cva("grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2");

export const viewTile = cva(
  "focus-visible:ring-primary-400 flex min-w-0 flex-col items-stretch gap-1.5 rounded-xl border p-2 text-xs font-medium outline-none focus-visible:ring-2",
  {
    variants: {
      selected: {
        true: "border-primary-400 bg-primary-500/10 text-fg",
        false: "border-fg/10 text-fg hover:border-fg/25",
      },
      fits: {
        true: "",
        false: "cursor-not-allowed opacity-50",
      },
    },
    defaultVariants: { selected: false, fits: true },
  }
);

export const viewName = cva("min-w-0 text-center");

export const viewSuggested = cva("text-success-vivid text-center font-mono text-[9.5px] tracking-[0.1em] uppercase");

export const viewToggle = cva("ml-auto");

export const lookGrid = cva("grid gap-3 @xl:grid-cols-2");

export const fieldLabel = cva("text-fg/70 flex min-w-0 flex-col gap-1.5 text-xs");

export const accentRow = cva("flex items-center gap-2");

export const accentDot = cva(
  "focus-visible:ring-primary-400 size-6 rounded-full bg-[var(--mix-acc)] outline-none ring-offset-2 focus-visible:ring-2",
  {
    variants: {
      selected: {
        true: "ring-fg ring-2",
        false: "",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const detailsGrid = cva("grid gap-3 @xl:grid-cols-2");

export const playlistChoice = cva("flex min-w-0 items-center gap-3");

export const newsUrl = cva("flex w-full min-w-0 flex-col gap-1");

export const newsUrlHint = cva("text-fg/60 text-[11px]");

export const iconSearch = cva("w-full");

export const iconGrid = cva(
  "grid max-h-44 grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1.5 overflow-y-auto p-0.5"
);

export const iconButton = cva(
  "focus-visible:ring-primary-400 flex aspect-square items-center justify-center rounded-lg border outline-none focus-visible:ring-2 [&_svg]:size-4",
  {
    variants: {
      selected: {
        true: "border-primary-400 bg-primary-500/15 text-primary-400",
        false: "border-fg/10 text-fg/70 hover:border-fg/25 hover:text-fg",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const iconEmpty = cva("text-fg/60 text-xs");

export const previewBar = cva("flex flex-wrap items-center justify-between gap-2");

export const previewLabel = cva("text-fg/60 font-mono text-[10.5px] tracking-wider uppercase");

export const previewTools = cva("flex items-center gap-1.5");

export const previewBox = cva("min-w-0");

export const previewHint = cva("text-fg/50 text-[11px]");

export const previewJson = cva(
  "border-fg/10 bg-fg/[0.03] text-fg/80 max-h-80 overflow-auto rounded-lg border p-3 font-mono text-[11px] break-words whitespace-pre-wrap"
);

export const previewCopy = cva("self-start");
