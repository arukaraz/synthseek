import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import type { PreviewFrame } from "./types";

export const galleryDialog = cva("sm:h-[min(90vh,880px)]", {
  variants: {
    workshop: {
      true: "sm:max-w-6xl",
      false: "sm:max-w-5xl",
    },
  },
  defaultVariants: { workshop: false },
});

export const galleryHeader = cva("flex flex-wrap items-center gap-3 px-4 pt-4 pr-14 pb-3 sm:pt-6 sm:pr-16 sm:pl-6");

export const galleryTitleBlock = cva("flex min-w-0 flex-1 flex-col gap-1");

export const gallerySubtitle = cva("text-fg/60 text-sm");

export const gallerySearch = cva("relative min-w-0 flex-1 sm:w-64 sm:flex-none");

export const searchIcon = cva("text-fg/40 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2");

export const searchField = cva("pl-9");

export const galleryScroll = cva("min-h-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6");

export const galleryGrid = cva("grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3");

export const galleryEmpty = cva("text-fg/60 py-12 text-center text-sm");

export const band = cva("sticky top-0 z-20 col-span-full -mx-4 backdrop-blur-xl sm:-mx-6");

export const bandInner = cva(
  "border-primary-500/20 from-primary-500/20 via-primary-500/10 to-primary-500/5 flex items-center gap-3 border-y bg-linear-to-r px-4 py-2.5 sm:px-6"
);

export const bandIcon = cva(
  "bg-primary-500/20 text-primary-400 flex size-7 shrink-0 items-center justify-center rounded-lg"
);

export const bandText = cva("flex min-w-0 flex-col");

export const bandTitle = cva("text-fg text-sm font-semibold");

export const bandDescription = cva("text-fg/60 hidden truncate text-xs sm:block");

export const bandCount = cva("text-fg/50 ml-auto shrink-0 font-mono text-[10.5px] tracking-wider uppercase");

export const galleryCard = cva(
  "bg-fg/[0.02] hover:border-primary-400/50 focus-within:border-primary-400/50 flex min-w-0 flex-col overflow-hidden rounded-2xl border transition-colors",
  {
    variants: {
      onBoard: {
        true: "border-success-vivid/40",
        false: "border-fg/10",
      },
    },
  }
);

export const cardPreview = cva(
  "bg-fg/[0.03] border-fg/10 relative grid h-[166px] place-items-center overflow-hidden border-b p-2"
);

export const previewFit = cva(
  "relative h-[var(--preview-h)] w-[var(--preview-w)] overflow-hidden rounded-lg shadow-lg"
);

export const previewStage = cva(
  "pointer-events-none absolute top-0 left-0 flex h-[var(--stage-h)] w-[var(--stage-w)] origin-top-left scale-[var(--preview-scale)] [&>*]:size-full"
);

export const onBoardBadge = cva(
  "bg-success-vivid/15 text-success-vivid absolute top-2.5 right-2.5 z-[1] inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm"
);

export const cardBody = cva("flex min-w-0 flex-1 flex-col gap-1.5 px-3 py-2.5");

export const cardHead = cva("flex min-w-0 items-center gap-2.5");

export const cardActions = cva("mt-auto flex items-center justify-between gap-1.5 pt-1");

export const cardAction = cva("shrink-0");

export const cardIcon = cva(
  "bg-primary-500/15 text-primary-400 flex size-8 shrink-0 items-center justify-center rounded-lg"
);

export const cardTitle = cva("text-fg min-w-0 flex-1 text-sm leading-tight font-semibold text-balance break-words");

export const cardCategory = cva("text-fg/60 shrink-0 text-[11px]");

export const cardDescription = cva("text-fg/60 line-clamp-2 text-xs");

export const visuallyHidden = cva("sr-only");

export const galleryToolbar = cva("flex flex-wrap items-center gap-3 px-4 sm:px-6");

export const galleryFilters = cva("flex min-w-0 basis-full items-center gap-2 sm:basis-auto");

export const galleryTabs = cva("ml-auto");

export const mineCard = cva(
  "bg-fg/[0.02] border-fg/10 hover:border-primary-400/50 focus-within:border-primary-400/50 flex min-w-0 flex-col overflow-hidden rounded-2xl border transition-colors"
);

export const mineBody = cva("flex min-w-0 flex-1 flex-col gap-1.5 p-3");

export const mineHead = cva("flex min-w-0 items-center gap-2");

export const mineTitle = cva("text-fg min-w-0 flex-1 truncate text-sm font-semibold");

export const mineAccent = cva("size-3 shrink-0 rounded-full bg-[var(--mix-acc)]");

export const mineDescription = cva("text-fg/70 line-clamp-2 text-xs");

export const mineMeta = cva("text-fg/60 truncate text-xs");

export const mineBasedOn = cva("text-fg/50 truncate text-[11px]");

export const mineBadge = cva(
  "border-success-vivid/45 text-success-vivid inline-flex items-center self-start rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-[0.06em] whitespace-nowrap uppercase"
);

export const mineActions = cva(
  "border-fg/10 mt-auto flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden border-t pt-2"
);

export const mineActionsEnd = cva("ml-auto flex shrink-0 items-center gap-0.5");

export const onBoardPill = cva(
  "bg-success-vivid/15 text-success-vivid inline-flex h-9 shrink-0 items-center gap-1 rounded-md px-3 text-xs font-semibold"
);

export const newCard = cva(
  "border-fg/20 hover:border-primary-400 flex min-h-60 flex-col items-center justify-center gap-3.5 rounded-2xl border border-dashed p-3 transition-colors"
);

export const newCardButton = cva(
  "from-primary-600 to-accent-600 text-primary-foreground shadow-primary-600/40 focus-visible:ring-primary-400 flex size-16 items-center justify-center rounded-[18px] bg-linear-to-br shadow-lg transition-transform outline-none hover:scale-105 focus-visible:ring-2 motion-reduce:transition-none [&_svg]:size-8"
);

export const importBody = cva("flex flex-col gap-3 p-6 sm:max-w-xl");

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
