import { cva, type VariantProps } from "class-variance-authority";

export const headerContainer = cva(
  "sticky top-0 z-50 h-16 w-full border-b border-fg/5 sm:h-[var(--height-header-wide)]",
  {
    variants: {
      blur: {
        none: "bg-surface/80",
        responsive: "bg-surface/80 sm:bg-surface/40 sm:backdrop-blur-2xl",
      },
    },
    defaultVariants: {
      blur: "responsive",
    },
  }
);

export type HeaderContainerProps = VariantProps<typeof headerContainer>;

export const decorativeLine = cva(
  "decorative-animation absolute right-0 bottom-0 left-0 h-px bg-linear-to-r from-transparent to-transparent",
  {
    variants: {
      color: {
        primary: "via-primary-500",
      },
    },
    defaultVariants: {
      color: "primary",
    },
  }
);

export const headerContent = cva("relative flex h-full w-full items-center gap-3 px-4 sm:gap-4 sm:px-6");

export const brandLink = cva("shrink-0 items-center", {
  variants: {
    hidden: {
      true: "hidden sm:flex",
      false: "flex",
    },
  },
  defaultVariants: { hidden: false },
});

export const brandIcon = cva("h-12 w-auto sm:h-9");

export const brandWordmark = cva("hidden sm:block sm:text-2xl");

export const omniPill = cva(
  "relative mx-auto h-10 min-w-0 max-w-[820px] flex-1 items-center gap-1.5 rounded-[13px] border py-[3px] pr-2.5 pl-[3px] transition-[border-color,box-shadow,background-color]",
  {
    variants: {
      open: {
        true: "border-primary-500/55 bg-primary-500/5 shadow-primary-500/20 flex shadow-lg",
        false: "border-fg/10 bg-fg/5 hidden sm:flex",
      },
    },
    defaultVariants: { open: false },
  }
);

export const navChips = cva("hidden shrink-0 items-center gap-0.5 sm:flex");

export const pillSeparator = cva("bg-fg/10 mx-1 hidden h-5 w-px shrink-0 sm:block");

export const omniField = cva(
  "text-fg/40 flex h-8 min-w-0 flex-1 items-center gap-2.5 pl-2 text-[13.5px] outline-none",
  {
    variants: {
      open: {
        true: "[&>svg:first-child]:text-primary-400",
        false: "focus-visible:text-fg/70 cursor-text",
      },
    },
    defaultVariants: { open: false },
  }
);

export const omniFieldIcon = cva("size-[15px] shrink-0");

export const omniPlaceholder = cva("min-w-0 flex-1 truncate text-left");

export const omniInput = cva(
  "text-fg placeholder:text-fg/40 min-w-0 flex-1 bg-transparent text-[13.5px] outline-none [&::-webkit-search-cancel-button]:hidden"
);

export const kbd = cva(
  "border-fg/15 text-fg/50 hidden shrink-0 items-center rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] leading-none sm:inline-flex"
);

export const clearButton = cva("text-fg/40 hover:bg-fg/10 hover:text-fg shrink-0 rounded p-1 transition-colors");

export const mobileSearchButton = cva(
  "text-fg/70 hover:text-fg hover:bg-fg/5 ml-auto flex size-10 items-center justify-center rounded-xl sm:hidden [&_svg]:size-5"
);

export const cancelButton = cva("text-primary-400 shrink-0 text-sm font-medium sm:hidden");

export const playerSlot = cva("hidden shrink-0 items-center empty:hidden sm:flex");

export const rightCluster = cva("hidden shrink-0 items-center gap-2.5 sm:flex");

export const headerTab = cva(
  "flex h-8 items-center gap-2 rounded-[10px] px-3 text-[13px] font-medium whitespace-nowrap transition-colors [&_svg]:size-[15px] [&_svg]:shrink-0",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground",
        false: "text-fg/60 hover:text-fg hover:bg-fg/5",
      },
    },
    defaultVariants: { active: false },
  }
);

export const scopeGroup = cva("items-center", {
  variants: {
    layout: {
      inline: "hidden shrink-0 gap-0.5 sm:flex",
      row: "-mx-2 flex gap-1 overflow-x-auto px-3 pt-1.5 pb-2.5 [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden",
    },
  },
});

export const scopeChip = cva(
  "focus-visible:ring-primary-400 inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[11.5px] font-medium whitespace-nowrap outline-none focus-visible:ring-2 [&_svg]:size-[13px]",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground shadow-primary-500/30 border-transparent font-semibold shadow-md",
        false: "border-fg/10 text-fg/70 hover:text-fg hover:bg-fg/5",
      },
    },
  }
);

export const scopeIcon = cva("", {
  variants: {
    type: {
      all: "",
      track: "type-text-track",
      album: "type-text-album",
      artist: "type-text-artist",
      playlist: "type-text-playlist",
    },
    active: {
      true: "text-current",
      false: "",
    },
  },
});

export const dropdownPanel = cva(
  "bg-surface-overlay w-[var(--radix-popover-trigger-width)] max-w-none rounded-2xl p-2 text-sm text-fg shadow-2xl"
);

export const groupLabel = cva("text-fg/50 px-2.5 pt-2 pb-1 font-mono text-[10px] tracking-[0.14em] uppercase");

export const optionList = cva("flex flex-col");

export const optionRow = cva(
  "grid cursor-pointer grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg px-2 py-1.5",
  {
    variants: {
      highlighted: {
        true: "bg-primary-500/15",
        false: "hover:bg-primary-500/10",
      },
      separated: {
        true: "border-fg/10 mt-1 rounded-t-none border-t pt-2",
        false: "",
      },
    },
    defaultVariants: { highlighted: false, separated: false },
  }
);

export const optionVisual = cva(
  "bg-primary-500/15 text-primary-400 relative flex size-8 items-center justify-center overflow-hidden rounded-lg [&>svg]:size-4"
);

export const optionTextColumn = cva("flex min-w-0 flex-col");

export const optionTitle = cva("text-fg truncate text-[13px]");

export const optionSubtitle = cva("text-fg/50 truncate text-[11.5px]");

export const noMatches = cva("text-fg/60 px-2.5 py-2 text-[12.5px]");

export const dropdownFooter = cva(
  "border-fg/10 text-fg/50 mt-1 hidden gap-3.5 border-t px-2.5 pt-2 pb-1 text-[11.5px] sm:flex"
);

export const footerHint = cva("inline-flex items-center gap-1");
