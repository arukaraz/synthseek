import { cva } from "class-variance-authority";

export const playlistRow = cva(
  "group border-fg/5 relative flex items-center gap-2 rounded-lg border-b px-2 py-1.5 transition-colors last:border-b-0",
  {
    variants: {
      current: {
        true: "bg-primary-500/10 before:bg-primary-400 before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-sm",
        false: "hover:bg-fg/5",
      },
      selected: {
        true: "bg-primary-500/15",
        false: "",
      },
    },
    defaultVariants: { current: false, selected: false },
  }
);

export const playlistRowNumber = cva("w-6 shrink-0 text-center text-xs tabular-nums", {
  variants: {
    current: {
      true: "text-primary-400 font-semibold",
      false: "text-fg/45",
    },
  },
  defaultVariants: { current: false },
});

export const playlistRowInfo = cva("flex min-w-0 flex-1 flex-col");

export const playlistRowTitle = cva("truncate text-sm font-medium", {
  variants: {
    current: {
      true: "text-primary-400",
      false: "text-fg",
    },
  },
  defaultVariants: { current: false },
});

export const playlistRowHover = cva(
  "flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-sm:hidden"
);

export const playlistRowIcon = cva(
  "text-fg/55 hover:bg-fg/10 hover:text-fg focus-visible:ring-primary-400 grid size-7 shrink-0 place-items-center rounded-full transition-colors outline-none focus-visible:ring-2 disabled:opacity-40"
);

export const playlistRowMore = cva("sm:hidden");

export const playlistRowStatus = cva("flex shrink-0 items-center gap-1");

export const playlistRowPlays = cva("text-fg/45 w-16 shrink-0 text-right text-xs tabular-nums max-sm:hidden");

export const playlistRowTime = cva("text-fg/45 w-9 shrink-0 text-right text-xs tabular-nums");

export const playlistMenuItem = cva("flex items-center gap-2");
