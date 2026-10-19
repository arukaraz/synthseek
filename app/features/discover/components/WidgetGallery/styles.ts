import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import type { PreviewFrame } from "./types";

export const galleryDialog = cva("sm:h-[min(90vh,880px)] sm:max-w-5xl");

export const galleryHeader = cva("flex flex-wrap items-center gap-3 px-4 pt-4 pr-14 pb-3 sm:pt-6 sm:pr-16 sm:pl-6");

export const galleryTitleBlock = cva("flex min-w-0 flex-1 flex-col gap-1");

export const gallerySearch = cva("relative w-full sm:w-72");

export const searchIcon = cva("text-fg/40 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2");

export const searchField = cva("pl-9");

export const galleryTabs = cva("px-4 sm:px-6");

export const galleryScroll = cva("min-h-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6");

export const galleryGrid = cva("grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3");

export const galleryEmpty = cva("text-fg/60 py-12 text-center text-sm");

export const band = cva("bg-surface sticky top-0 z-10 col-span-full -mx-1 px-1 pt-2 pb-1");

export const bandInner = cva(
  "border-primary-500/20 from-primary-500/15 via-primary-500/5 flex items-center gap-3 rounded-xl border bg-linear-to-r to-transparent px-3 py-2"
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
  "bg-success-vivid/15 text-success-vivid absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
);

export const cardFooter = cva("flex min-w-0 items-center gap-2.5 px-3 py-2.5");

export const cardIcon = cva(
  "bg-primary-500/15 text-primary-400 flex size-8 shrink-0 items-center justify-center rounded-lg"
);

export const cardTitleRow = cva("flex min-w-0 flex-1 items-center gap-1");

export const cardTitle = cva("text-fg truncate text-sm font-semibold");

export function previewVars(frame: PreviewFrame): CssVars {
  return {
    "--preview-w": `${frame.width}px`,
    "--preview-h": `${frame.height}px`,
    "--stage-w": `${frame.stageWidth}px`,
    "--stage-h": `${frame.stageHeight}px`,
    "--preview-scale": String(frame.scale),
  };
}
