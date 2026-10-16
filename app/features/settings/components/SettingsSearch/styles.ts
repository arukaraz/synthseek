import { cva } from "class-variance-authority";

export const searchBox = cva("relative mb-1");

export const searchIcon = cva("text-fg/40 pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2");

export const searchInput = cva("pr-8 pl-9");

export const searchClear = cva(
  "text-fg/50 hover:text-fg absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 transition-colors"
);

export const searchShortcut = cva(
  "text-fg/40 border-fg/15 pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border px-1.5 font-mono text-[10px]"
);

export const searchSummary = cva("text-fg/50 px-3 pt-1 pb-2 text-xs");

export const searchResult = cva(
  "hover:bg-fg/5 focus-visible:ring-primary-500/50 flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
);

export const searchResultLabel = cva("text-fg block truncate text-sm");

export const searchResultPlace = cva("text-fg/50 block truncate text-xs");

export const searchMatch = cva("text-primary-400 rounded-sm bg-transparent font-semibold");

export const paletteContent = cva("flex flex-col gap-3 sm:max-w-xl");

export const paletteList = cva("flex max-h-[55vh] flex-col gap-0.5 overflow-y-auto");

export const paletteGroupLabel = cva("text-fg/50 px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider uppercase");

export const paletteItem = cva(
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors focus-visible:outline-none",
  {
    variants: {
      active: {
        true: "bg-fg/10",
        false: "hover:bg-fg/5",
      },
    },
    defaultVariants: { active: false },
  }
);

export const paletteItemIcon = cva("text-fg/50 size-4 shrink-0");

export const paletteItemText = cva("min-w-0 flex-1");

export const paletteHint = cva("text-fg/45 px-3 text-xs");
