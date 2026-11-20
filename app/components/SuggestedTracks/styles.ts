import { cva } from "class-variance-authority";

export const suggestedRoot = cva("@container flex min-h-0 min-w-0 flex-1 flex-col");

export const suggestedHead = cva("flex shrink-0 items-center gap-2.5 px-4.5 pt-3 pb-2");

export const suggestedTitles = cva("flex min-w-0 flex-1 flex-col");

export const suggestedTitle = cva("text-fg text-sm font-bold");

export const suggestedSub = cva("text-fg/50 truncate text-xs");

export const suggestedRefresh = cva(
  "text-fg/60 hover:bg-fg/10 hover:text-fg focus-visible:ring-primary-400 grid size-8 shrink-0 place-items-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-40"
);

export const suggestedScroll = cva("min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4");

export const suggestedRow = cva(
  "border-fg/5 hover:bg-fg/5 grid grid-cols-[30px_40px_minmax(0,1fr)_28px_92px] items-center gap-x-2 rounded-lg border-b px-2 py-1.5 last:border-b-0 @[420px]:grid-cols-[34px_40px_minmax(0,1fr)_30px_138px] @[420px]:gap-x-2.5"
);

export const suggestedListen = cva(
  "focus-visible:ring-primary-400 grid size-8 place-items-center rounded-full transition-colors outline-none focus-visible:ring-2",
  {
    variants: {
      active: {
        true: "text-accent-400",
        false: "text-fg/55 hover:text-fg",
      },
    },
    defaultVariants: { active: false },
  }
);

export const suggestedCover = cva("bg-fg/10 relative block size-10 overflow-hidden rounded-md");

export const suggestedCoverImage = cva("h-full w-full object-cover");

export const suggestedCoverInitials = cva("text-fg/60 grid h-full w-full place-items-center text-[11px] font-bold");

export const suggestedInfo = cva("flex min-w-0 flex-col");

export const suggestedName = cva("text-fg truncate text-sm font-medium");

export const suggestedArtist = cva("truncate text-xs", {
  variants: {
    previewing: {
      true: "text-accent-400 tabular-nums",
      false: "text-fg/55",
    },
  },
  defaultVariants: { previewing: false },
});

export const suggestedHide = cva(
  "text-fg/45 hover:bg-fg/10 hover:text-fg focus-visible:ring-primary-400 grid h-8 w-full place-items-center rounded-md transition-colors outline-none focus-visible:ring-2"
);

export const suggestedAdd = cva(
  "focus-visible:ring-primary-400 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 disabled:opacity-50",
  {
    variants: {
      tone: {
        add: "border-fg/15 text-fg/70 hover:bg-fg/10 hover:text-fg",
        request: "border-primary-500/45 text-primary-400 hover:bg-primary-500/20 hover:text-fg",
      },
    },
    defaultVariants: { tone: "add" },
  }
);

export const suggestedAddLong = cva("hidden @[420px]:inline");

export const suggestedSkeleton = cva("flex items-center gap-2.5 px-2 py-2");

export const suggestedSkeletonBlock = cva("bg-fg/10 block animate-pulse rounded-md", {
  variants: {
    shape: {
      disc: "size-8 rounded-full",
      cover: "size-10",
      line: "h-3.5 flex-1",
      pill: "h-7 w-[70px]",
    },
  },
});

export const suggestedNote = cva("text-fg/50 px-3 py-5 text-center text-xs");

export const suggestedRetry = cva("text-primary-400 hover:text-fg mt-2 block w-full text-center text-xs font-semibold");
