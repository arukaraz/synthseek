import { cva } from "class-variance-authority";

export const configSheet = cva("shadow-2xl sm:max-w-lg");

export const configBody = cva("flex flex-col gap-4 px-4 pt-4 pb-4");

export const configHeaderRow = cva("border-fg/10 flex shrink-0 items-center gap-3 border-b py-3.5 pr-14 pl-4");

export const configHeaderCover = cva(
  "bg-fg/10 from-primary-500/30 to-accent-500/30 relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br"
);

export const configHeaderText = cva("flex min-w-0 flex-col items-start gap-0.5");

export const configHeaderTitle = cva("text-fg w-full truncate text-base font-bold");

export const configHeaderMeta = cva("text-fg/50 w-full truncate text-xs");

export const recipeHead = cva("flex items-center justify-between gap-2");

export const recipeHeading = cva("text-fg/80 text-xs font-semibold tracking-wide uppercase");

export const recipeHint = cva("text-fg/50 text-xs");

export const recipeList = cva("border-fg/10 bg-fg/5 overflow-hidden rounded-xl border");

export const recipeRow = cva("border-fg/10 border-b last:border-b-0", {
  variants: {
    open: {
      true: "bg-surface/70",
      false: "",
    },
  },
  defaultVariants: { open: false },
});

export const recipeRowButton = cva(
  "enabled:hover:bg-fg/5 grid w-full grid-cols-[6rem_minmax(0,1fr)_auto] items-center gap-2.5 px-3 py-2.5 text-left transition-colors disabled:cursor-default"
);

export const recipeRowLabel = cva("text-fg/50 text-xs font-medium");

export const recipeRowValue = cva("text-fg truncate text-sm font-semibold");

export const recipeRowTrail = cva("text-fg/40 flex items-center gap-1.5");

export const recipeChangedDot = cva("bg-warning-vivid size-1.5 rounded-full");

export const recipeChevron = cva("size-3.5 transition-transform motion-reduce:transition-none", {
  variants: {
    open: {
      true: "rotate-90",
      false: "",
    },
  },
  defaultVariants: { open: false },
});

export const recipeEditor = cva("flex flex-col gap-3 px-3 pt-1 pb-3.5");

export const recipeRestore = cva(
  "text-fg/50 hover:bg-primary-500/10 hover:text-fg inline-flex items-center gap-1 self-start rounded-md px-1.5 py-0.5 text-xs transition-colors"
);

export const editorField = cva("flex flex-col gap-1.5");

export const editorLabel = cva("text-fg/70 text-xs font-semibold");

export const editorHelp = cva("text-fg/50 text-xs");

export const editorGrid = cva("grid grid-cols-1 gap-3 sm:grid-cols-2");

export const choicePills = cva("flex flex-wrap gap-1.5");

export const choicePill = cva("rounded-full border px-3 py-1 text-sm transition-colors", {
  variants: {
    active: {
      true: "border-primary-500 bg-primary-500/20 text-fg font-semibold",
      false: "border-fg/10 bg-fg/5 text-fg/70 hover:border-primary-500/30",
    },
  },
  defaultVariants: { active: false },
});

export const footerSummary = cva("flex min-w-0 flex-1 flex-col");

export const footerSummaryTitle = cva("text-fg truncate text-xs font-semibold");

export const footerSummaryNote = cva("text-fg/50 truncate text-[11px]");

export const fieldGroup = cva("space-y-3");

export const sectionStack = cva("space-y-3 sm:space-y-4");

export const sectionHeading = cva("text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm");

export const presetNote = cva("text-fg/60 text-sm");

export const fieldLabel = cva("text-fg/90 mb-1.5 block text-sm font-medium");

export const destinationNote = cva("text-fg/60 flex flex-wrap items-center gap-1.5 text-xs");

export const lidarrTagsField = cva(
  "border-fg/10 bg-fg/5 focus-within:border-primary-500/50 focus-within:ring-primary-500/30 flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors focus-within:ring-2"
);

export const lidarrTagChip = cva(
  "border-primary-500/30 bg-primary-500/15 text-fg/90 inline-flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-2.5 text-xs font-medium"
);

export const lidarrTagChipRemove = cva(
  "text-fg/50 hover:bg-primary-500/25 hover:text-fg/90 inline-flex size-4 items-center justify-center rounded-full transition-colors"
);

export const lidarrTagInputField = cva(
  "text-fg placeholder:text-fg/30 min-w-24 flex-1 bg-transparent text-sm outline-none"
);

export const lidarrTagSuggestion = cva(
  "text-fg/80 hover:bg-primary-500/15 hover:text-fg flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm outline-none transition-colors focus-visible:bg-primary-500/15"
);

export const acquisitionAutoRow = cva("border-fg/10 bg-fg/5 flex items-center gap-3 rounded-lg border px-3 py-2.5");

export const acquisitionRow = cva("flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors", {
  variants: {
    active: {
      true: "bg-primary-500/10 border-primary-500/40",
      false: "bg-fg/5 border-fg/10 opacity-60",
    },
  },
  defaultVariants: { active: false },
});

export const acquisitionRowLabel = cva("text-fg text-sm font-medium");

export const acquisitionRowLead = cva("text-fg text-sm font-bold");

export const acquisitionRowDescription = cva("text-fg/50 text-xs");

export const acquisitionSourceList = cva("flex flex-col gap-2");

export const acquisitionRowBody = cva("flex min-w-0 flex-1 flex-col");

export const acquisitionRowPosition = cva("text-fg/60 w-4 shrink-0 text-center text-xs font-semibold tabular-nums");

export const acquisitionHint = cva("text-xs", {
  variants: {
    interactive: {
      true: "text-primary-400 self-start underline-offset-2 hover:underline",
      false: "text-fg/50",
    },
  },
  defaultVariants: { interactive: false },
});
