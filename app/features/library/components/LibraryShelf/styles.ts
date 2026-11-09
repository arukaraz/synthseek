import { cva } from "class-variance-authority";

export const shelfHeader = cva("flex flex-col sm:hidden");

export const shelfTitleRow = cva("flex items-center gap-1 pt-2.5 pr-0 pb-1.5 pl-1");

export const shelfTitleText = cva("flex min-w-0 flex-1 flex-col");

export const shelfTitle = cva("text-fg text-2xl leading-tight font-extrabold tracking-tight");

export const shelfTitleLine = cva("flex min-w-0 items-baseline gap-2");

export const shelfViewName = cva(
  "flex min-w-0 items-baseline gap-2 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none",
  {
    variants: {
      shown: {
        true: "translate-x-0 opacity-100",
        false: "pointer-events-none -translate-x-1 opacity-0",
      },
    },
    defaultVariants: { shown: false },
  }
);

export const shelfViewSlash = cva("text-fg/25 text-xl leading-tight font-light");

export const shelfViewLabel = cva("text-primary-400 truncate text-xl leading-tight font-bold tracking-tight");

export const shelfCount = cva(
  "text-fg/60 overflow-hidden text-[12.5px] tabular-nums transition-[max-height,opacity] duration-300 ease-out motion-reduce:transition-none",
  {
    variants: { collapsed: { true: "max-h-0 opacity-0", false: "max-h-5 opacity-100" } },
    defaultVariants: { collapsed: false },
  }
);

export const shelfFold = cva(
  "-mx-4 grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
  {
    variants: { collapsed: { true: "grid-rows-[0fr] opacity-0", false: "grid-rows-[1fr] opacity-100" } },
    defaultVariants: { collapsed: false },
  }
);

export const shelfFoldInner = cva("flex min-h-0 flex-col overflow-hidden px-4");

export const shelfIconButton = cva(
  "text-fg/60 hover:bg-fg/10 hover:text-fg relative grid size-10 shrink-0 place-items-center rounded-full transition-colors",
  {
    variants: { active: { true: "text-primary-400", false: "" } },
    defaultVariants: { active: false },
  }
);

export const shelfSearchRow = cva("flex items-center gap-2 pb-2");

export const shelfSearchField = cva(
  "border-fg/15 bg-fg/[0.04] text-fg/60 focus-within:border-primary-400/60 focus-within:ring-primary-500/20 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] border px-3 text-sm focus-within:ring-3"
);

export const shelfSearchInput = cva(
  "text-fg placeholder:text-fg/50 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
);

export const shelfSearchCancel = cva("text-fg/80 hover:text-fg shrink-0 px-2 text-sm font-medium");

export const shelfPillsScroll = cva(
  "border-fg/10 -mx-4 mb-2.5 overflow-x-auto overflow-y-hidden border-b px-4 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
);

export const shelfTabs = cva("inline-flex gap-5");

export const shelfTab = cva(
  "relative inline-flex h-10 items-center gap-1.5 text-[14px] font-semibold whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:transition-colors",
  {
    variants: {
      active: {
        true: "text-primary-400 after:bg-primary-400",
        false: "text-fg/55 hover:text-fg after:bg-transparent",
      },
    },
    defaultVariants: { active: false },
  }
);

export const shelfTabCount = cva("font-mono text-[11px] font-medium tabular-nums opacity-80");

export const shelfControlsRow = cva("flex items-center gap-2 pb-2");

export const shelfLayoutSegment = cva("border-fg/10 flex border");

export const shelfLayoutButton = cva("grid size-9 place-items-center transition-colors", {
  variants: {
    active: {
      true: "bg-primary-500 text-primary-foreground",
      false: "text-fg/60 hover:text-fg",
    },
  },
  defaultVariants: { active: false },
});

export const shelfSelectToggle = cva("grid size-9 shrink-0 place-items-center border transition-colors", {
  variants: {
    active: {
      true: "border-primary-400/60 bg-primary-500/15 text-primary-400",
      false: "border-fg/10 text-fg/60 hover:text-fg",
    },
  },
  defaultVariants: { active: false },
});

export const shelfChip = cva(
  "inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      active: {
        true: "text-fg border-primary-400/55 bg-primary-500/15",
        false: "border-fg/10 text-fg/70 bg-fg/[0.04]",
      },
    },
    defaultVariants: { active: false },
  }
);

export const shelfChipCount = cva("text-primary-400 font-mono text-[11px] tabular-nums");

export const shelfActiveRow = cva(
  "-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-2 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
);

export const shelfActiveChip = cva(
  "text-fg border-primary-400/45 bg-primary-500/15 inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border pr-1.5 pl-2.5 text-xs font-medium"
);

export const shelfActiveChipX = cva("bg-fg/15 grid size-[18px] place-items-center rounded-full");

export const shelfActiveClear = cva("text-fg/60 shrink-0 px-1.5 text-xs underline underline-offset-[3px]");

export const sheetGroupHeading = cva(
  "text-fg/60 px-3.5 pt-3 pb-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase"
);

export const sheetMenuItem = cva(
  "hover:bg-fg/[0.06] flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[14.5px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      selected: { true: "bg-primary-500/15", false: "" },
      tone: { default: "text-fg", danger: "text-destructive-vivid" },
    },
    defaultVariants: { selected: false, tone: "default" },
  }
);

export const sheetMenuCheck = cva("text-primary-400 ml-auto size-4");

export const sheetSeparator = cva("bg-fg/10 mx-3 my-1.5 h-px");

export const sheetOrderRow = cva("px-3 pb-1.5");

export const sheetOrderSegment = cva("border-fg/10 bg-fg/[0.06] flex gap-0.5 rounded-full border p-[3px]");

export const sheetOrderButton = cva(
  "inline-flex h-[30px] flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors",
  {
    variants: {
      active: { true: "bg-primary-500 text-primary-foreground", false: "text-fg/60" },
    },
    defaultVariants: { active: false },
  }
);
