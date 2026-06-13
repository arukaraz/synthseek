import { cva } from "class-variance-authority";

export const inlineSelect = cva(
  "rounded-md border border-fg/15 bg-fg/[0.02] px-3 py-2 text-sm text-fg outline-none focus:border-fg/30"
);

export const toggleButton = cva(
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
  {
    variants: {
      selected: {
        true: "border-primary-500/60 bg-primary-500/20 text-fg",
        false: "border-fg/15 bg-fg/[0.02] text-fg/70 hover:border-fg/30 hover:bg-fg/[0.05] hover:text-fg",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const disabledOverlay = cva("flex flex-col gap-4 transition-opacity", {
  variants: {
    disabled: {
      true: "pointer-events-none opacity-40",
      false: "opacity-100",
    },
  },
  defaultVariants: { disabled: false },
});

export const fixedFeedRow = cva("flex flex-col gap-1 rounded-md border border-fg/10 bg-fg/[0.02] px-3 py-2 text-sm");

export const fixedFeedLabel = cva("text-fg font-medium");

export const fixedFeedDescription = cva("text-fg/60 text-xs");

export const apiKeyWarningBox = cva(
  "flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200"
);

export const schedulePickerTrigger = cva(
  "inline-flex h-10 w-full cursor-pointer items-center gap-2 rounded-md border border-fg/15 bg-fg/[0.02] px-3 text-sm text-fg outline-none transition-colors hover:border-fg/30 focus:border-fg/30 disabled:cursor-not-allowed disabled:opacity-40"
);

export const schedulePickerContent = cva("flex w-72 flex-col gap-4 p-3");

export const schedulePickerSection = cva("flex flex-col gap-2");

export const schedulePickerSectionLabel = cva("text-fg/60 text-[11px] font-medium uppercase tracking-wide");

export const scheduleDayChip = cva(
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-md border text-xs font-medium transition-colors",
  {
    variants: {
      selected: {
        true: "border-primary-500/60 bg-primary-500/20 text-fg",
        false: "border-fg/15 bg-fg/[0.02] text-fg/70 hover:border-fg/30 hover:bg-fg/[0.05] hover:text-fg",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const scheduleHourGrid = cva("grid grid-cols-4 gap-1.5");

export const subSection = cva("flex h-full flex-col gap-4");

export const subSectionSaveBar = cva("mt-auto");

export const playlistChipsGrid = cva("grid grid-cols-4 gap-1.5");

export const playlistChip = cva(
  "inline-flex h-8 w-full cursor-pointer items-center justify-center truncate rounded-md border px-2 text-[11px] font-medium transition-colors",
  {
    variants: {
      selected: {
        true: "border-primary-500/60 bg-primary-500/20 text-fg",
        false: "border-fg/15 bg-fg/[0.02] text-fg/70 hover:border-fg/30 hover:bg-fg/[0.05] hover:text-fg",
      },
    },
    defaultVariants: { selected: false },
  }
);

export const discoveryGrid = cva("grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2");

export const discoverySubBoundary = cva(
  "border-fg/10 border-t pt-5 md:border-t-0 md:pt-0 md:border-l md:pl-6 [&:first-child]:border-t-0 [&:first-child]:pt-0 md:[&:first-child]:border-l-0 md:[&:first-child]:pl-0"
);

export const subSectionHeader = cva("flex items-start justify-between gap-3");

export const subSectionTitle = cva("text-fg text-sm font-semibold");

export const autoRequestRow = cva(
  "border-fg/10 bg-fg/[0.02] flex items-start justify-between gap-3 rounded-lg border p-3"
);

export const autoRequestText = cva("flex flex-col gap-0.5");

export const autoRequestLabel = cva("text-fg text-sm font-medium");

export const autoRequestHelper = cva("text-fg/55 text-xs");

export const replacePlaylistRow = cva(
  "border-fg/10 bg-fg/[0.02] flex items-start justify-between gap-3 rounded-lg border p-3 transition-opacity",
  {
    variants: {
      disabled: {
        true: "opacity-40",
        false: "opacity-100",
      },
    },
    defaultVariants: { disabled: false },
  }
);

export const scheduleHourChip = cva(
  "inline-flex h-8 cursor-pointer items-center justify-center rounded-md border text-[11px] font-medium transition-colors",
  {
    variants: {
      selected: {
        true: "border-primary-500/60 bg-primary-500/20 text-fg",
        false: "border-fg/10 bg-fg/[0.02] text-fg/60 hover:border-fg/30 hover:bg-fg/[0.05] hover:text-fg",
      },
    },
    defaultVariants: { selected: false },
  }
);
