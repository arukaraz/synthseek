import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import type { PreviewFrame } from "./types";

export const galleryDialog = cva("sm:h-[min(90vh,55rem)]", {
  variants: {
    workshop: {
      true: "sm:max-w-320",
      false: "sm:max-w-5xl",
    },
  },
  defaultVariants: { workshop: false },
});

export const gallerySearch = cva("relative min-w-0 flex-1 sm:w-64 sm:flex-none");

export const searchIcon = cva("text-fg/40 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2");

export const searchField = cva("pl-9");

export const galleryScroll = cva("min-h-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6");

export const galleryGrid = cva("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3");

export const galleryEmpty = cva("text-fg/60 py-12 text-center text-sm");

export const band = cva("bg-surface/95 sticky top-0 z-20 col-span-full -mx-4 sm:-mx-6");

export const bandInner = cva(
  "border-primary-500/20 from-primary-500/20 via-primary-500/10 to-primary-500/5 flex items-center gap-3 border-y bg-linear-to-r px-4 py-2.5 sm:px-6"
);

export const bandIcon = cva(
  "bg-primary-500/20 text-primary-400 flex size-7 shrink-0 items-center justify-center rounded-lg"
);

export const bandText = cva("flex min-w-0 flex-col");

export const bandTitle = cva("text-fg text-sm font-semibold");

export const bandDescription = cva("text-fg/60 hidden truncate text-xs sm:block");

export const bandCount = cva("text-fg/50 ml-auto shrink-0 font-mono text-10 tracking-wider uppercase");

export const galleryCard = cva(
  "bg-fg/[0.02] hover:border-primary-400/50 focus-within:border-primary-400/50 flex min-w-0 flex-col overflow-hidden rounded-2xl border transition-colors [contain-intrinsic-size:auto_320px] [content-visibility:auto]",
  {
    variants: {
      onBoard: {
        true: "border-success-vivid/40",
        false: "border-fg/10",
      },
      ghost: {
        true: "opacity-55 hover:border-fg/10",
        false: "",
      },
    },
    defaultVariants: { ghost: false },
  }
);

export const cardPreview = cva(
  "bg-fg/[0.03] border-fg/10 relative grid h-41.5 place-items-center overflow-hidden border-b p-2"
);

export const previewFit = cva(
  "relative h-[var(--preview-h)] w-[var(--preview-w)] overflow-hidden rounded-lg shadow-lg"
);

export const previewStage = cva(
  "pointer-events-none absolute top-0 left-0 flex h-[var(--stage-h)] w-[var(--stage-w)] origin-top-left scale-[var(--preview-scale)] [&_*]:[backdrop-filter:none] [&>*]:size-full"
);

export const onBoardBadge = cva(
  "bg-surface/90 border-success-vivid/40 text-success-vivid absolute top-2.5 right-2.5 z-[1] inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-11 font-semibold"
);

export const cardBody = cva("flex min-w-0 flex-1 flex-col gap-1.5 px-3 py-2.5 [&>:nth-last-child(2)]:mb-2.5");

export const cardHead = cva("flex min-w-0 items-center gap-2.5");

export const cardActions = cva("border-fg/10 mt-auto flex flex-wrap items-center gap-1.5 border-t pt-2");

export const layoutChevron = cva("size-3.5 opacity-70");

export const bulkTrigger = cva("shrink-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50");

export const cardAction = cva("shrink-0");

export const cardIcon = cva(
  "bg-primary-500/15 text-primary-400 flex size-8 shrink-0 items-center justify-center rounded-lg"
);

export const cardTitle = cva("text-fg min-w-0 flex-1 text-sm leading-tight font-semibold text-balance break-words");

export const cardCategory = cva(
  "border-fg/10 bg-fg/5 text-fg/70 inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-11 leading-none font-semibold whitespace-nowrap"
);

export const cardMeta = cva("flex min-w-0 flex-wrap items-center gap-1");

export const sourcePills = cva("inline-flex min-w-0 flex-wrap items-center gap-1");

export const periodBadge = cva(
  "bg-surface/90 border-fg/15 text-fg/80 absolute bottom-2.5 left-2.5 z-[1] rounded-full border px-2 py-0.5 text-11 font-semibold"
);

export const cardNeeds = cva("text-fg/55 text-xs font-medium");

export const sourceCallout = cva(
  "col-span-full flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-3 py-2.5 sm:flex-nowrap",
  {
    variants: {
      unknown: {
        true: "border-fg/15 bg-fg/[0.03]",
        false: "border-warning-vivid/30 bg-warning-vivid/10",
      },
    },
    defaultVariants: { unknown: false },
  }
);

export const sourceCalloutText = cva("flex min-w-0 flex-1 flex-col gap-0.5");

export const sourceReasonWhy = cva("text-fg text-xs font-semibold");

export const sourceReasonWho = cva("text-fg/70 text-xs");

export const sourceTooltip = cva("flex flex-col gap-0.5");

export const sourceStatusRetry = cva("w-full");

export const cardDescription = cva("text-fg/60 text-xs");

export const clampedBlock = cva("flex min-w-0 flex-col items-start gap-0.5");

export const clampedBody = cva("min-w-0", {
  variants: {
    expanded: {
      true: "",
      false: "line-clamp-2",
    },
  },
  defaultVariants: { expanded: false },
});

export const clampedToggle = cva(
  "text-primary-400 hover:text-primary-500 focus-visible:ring-primary-400 rounded text-xs font-medium outline-none focus-visible:ring-2"
);

export const visuallyHidden = cva("sr-only");

export const galleryToolbar = cva("flex flex-wrap items-center gap-3 px-4 pb-4 sm:px-6");

export const galleryFilters = cva("flex min-w-0 basis-full items-center gap-2 sm:basis-auto");

export const galleryTabs = cva("ml-auto");

export const mineCard = cva(
  "bg-fg/[0.02] border-fg/10 hover:border-primary-400/50 focus-within:border-primary-400/50 flex min-w-0 flex-col overflow-hidden rounded-2xl border transition-colors"
);

export const mineBody = cva("flex min-w-0 flex-1 flex-col gap-1.5 p-3 [&>:nth-last-child(2)]:mb-2.5");

export const mineHead = cva("flex min-w-0 items-center gap-2");

export const mineTitle = cva("text-fg min-w-0 flex-1 truncate text-sm font-semibold");

export const mineAccent = cva("size-3 shrink-0 rounded-full bg-mix-acc");

export const mineDescription = cva("text-fg/70 text-xs");

export const mineMeta = cva("text-fg/60 truncate text-xs");

export const mineBasedOn = cva("text-fg/50 truncate text-11");

export const minePlaylist = cva(
  "text-success-vivid focus-visible:ring-primary-400 grid size-7.5 shrink-0 place-items-center rounded-lg outline-none focus-visible:ring-2"
);

export const mineActions = cva(
  "border-fg/10 mt-auto flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden border-t pt-2"
);

export const mineActionsEnd = cva("ml-auto flex shrink-0 items-center gap-0.5");

export const onBoardPill = cva(
  "bg-success-vivid/15 text-success-vivid inline-flex h-9 shrink-0 items-center gap-1 rounded-md px-3 text-xs font-semibold"
);

export const newCard = cva("border-fg/10 bg-fg/[0.02] flex min-w-0 flex-col rounded-2xl border p-3");

export const newCardHead = cva("border-fg/10 flex items-center gap-3 border-b px-1 pb-3");

export const newCardRows = cva("flex flex-1 flex-col justify-center gap-1 pt-2");

export const newCardBadge = cva(
  "from-primary-600 to-accent-600 text-overlay-fg shadow-primary-600/40 flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br shadow-md [&_svg]:size-5"
);

export const newCardText = cva("flex min-w-0 flex-col");

export const newCardTitle = cva("text-fg text-sm font-semibold");

export const newCardSubtitle = cva("text-fg/60 text-xs");

export const newCardRow = cva(
  "group hover:bg-primary-500/15 focus-visible:ring-primary-400 flex min-h-13 w-full min-w-0 items-center gap-3 rounded-xl px-2 text-left transition-colors outline-none focus-visible:ring-2 motion-reduce:transition-none"
);

export const newCardIcon = cva("flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4.5", {
  variants: {
    tone: {
      recipe: "bg-primary-500/20 text-primary-400",
      feed: "bg-accent-500/20 text-accent-400",
      json: "bg-fg/10 text-fg/70",
    },
  },
});

export const newCardLabel = cva("text-fg text-sm font-medium");

export const newCardHint = cva("text-fg/60 truncate text-xs");

export const newCardChevron = cva(
  "text-fg/40 group-hover:text-primary-400 ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
);

export const importBody = cva("p-6 sm:max-w-xl");

export const importStack = cva("flex flex-col gap-5");

export const importField = cva(
  "border-fg/15 bg-fg/5 text-fg focus:border-primary-500/50 focus:ring-primary-500/30 h-56 w-full resize-y rounded-lg border p-3 font-mono text-xs outline-none focus:ring-2"
);

export const importProblems = cva("text-destructive-vivid mt-1 flex list-disc flex-col gap-1 pl-5 text-xs");

export const importProblem = cva("break-words");

export const importActions = cva("flex justify-end gap-2");

export function previewVars(frame: PreviewFrame): CssVars {
  return {
    "--preview-w": `${frame.width}px`,
    "--preview-h": `${frame.height}px`,
    "--stage-w": `${frame.stageWidth}px`,
    "--stage-h": `${frame.stageHeight}px`,
    "--preview-scale": String(frame.scale),
  };
}
