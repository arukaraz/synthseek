import { cva, type VariantProps } from "class-variance-authority";

export const requestsView = cva("from-primary-500/5 via-primary-400/0 relative flex h-full flex-col bg-gradient-to-t", {
  variants: {},
  defaultVariants: {},
});

export type RequestsViewProps = VariantProps<typeof requestsView>;

export const compactView = cva("grid gap-4 p-4", {
  variants: {
    cols: {
      responsive: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    },
  },
  defaultVariants: {
    cols: "responsive",
  },
});

export type CompactViewProps = VariantProps<typeof compactView>;

export const tableContainer = cva(
  "border-fg/10 bg-surface/30 overflow-hidden rounded-xl border sm:bg-surface/20 sm:backdrop-blur-sm",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type TableContainerProps = VariantProps<typeof tableContainer>;

export const tableRow = cva(
  "border-fg/5 hover:bg-fg/5 group flex items-center gap-4 border-b p-3 transition-colors last:border-b-0",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type TableRowProps = VariantProps<typeof tableRow>;

export const toolbar = cva(
  "border-fg/10 bg-surface/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 sm:bg-surface/20 sm:p-4 sm:backdrop-blur-sm",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type ToolbarProps = VariantProps<typeof toolbar>;

export const searchInputContainer = cva(
  "text-fg placeholder-fg/30 border-fg/10 bg-fg/5 w-full rounded-lg border py-1.5 text-sm outline-none transition-colors",
  {
    variants: {
      focus: {
        primary: "focus:border-primary-500/50 focus:bg-primary-500/5",
      },
      padding: {
        withIcon: "pr-8 pl-9",
        simple: "pr-8 pl-3",
      },
      width: {
        full: "w-full",
        fixed: "w-40 lg:w-48",
      },
    },
    defaultVariants: {
      focus: "primary",
      padding: "withIcon",
      width: "full",
    },
  }
);

export type SearchInputContainerProps = VariantProps<typeof searchInputContainer>;

export const cardHeader = cva("relative flex items-center gap-3 p-3", {
  variants: {
    border: {
      bottom: "border-b border-fg/10",
    },
  },
  defaultVariants: {},
});

export type CardHeaderProps = VariantProps<typeof cardHeader>;

export const trackItem = cva("hover:bg-fg/5 flex items-center gap-3 rounded-lg px-2 transition-colors", {
  variants: {
    size: {
      sm: "py-1.5",
      md: "py-2",
    },
    group: {
      track: "group/track",
      none: "",
    },
  },
  defaultVariants: {
    size: "sm",
    group: "track",
  },
});

export type TrackItemProps = VariantProps<typeof trackItem>;

export const trackListTrigger = cva(
  "group/trigger text-fg/60 hover:text-fg mt-3 flex w-full items-center gap-1.5 text-xs transition-colors",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type TrackListTriggerProps = VariantProps<typeof trackListTrigger>;

export const actionButtonLabel = cva("w-full transition-all", {
  variants: {
    color: {
      primary:
        "border-primary-500/30 bg-primary-500/10 text-primary-300 hover:border-primary-500/50 hover:bg-primary-500/20 hover:text-primary-200",
      warning:
        "border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:border-yellow-500/50 hover:bg-yellow-500/20 hover:text-yellow-200",
      danger:
        "border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});

export type ActionButtonLabelProps = VariantProps<typeof actionButtonLabel>;

export const mobileActionsButton = cva("flex items-center justify-center rounded-lg transition-colors", {
  variants: {
    size: {
      sm: "size-8",
      md: "size-10",
    },
    color: {
      default: "text-fg/40 hover:bg-fg/10 hover:text-fg",
    },
  },
  defaultVariants: {
    size: "sm",
    color: "default",
  },
});

export type MobileActionsButtonProps = VariantProps<typeof mobileActionsButton>;

export const toolbarContainer = cva("border-fg/5 flex items-center justify-between gap-3 border-b px-3 py-2 sm:px-4", {
  variants: {},
  defaultVariants: {},
});

export type ToolbarContainerProps = VariantProps<typeof toolbarContainer>;

export const searchInput = cva(
  "text-fg placeholder-fg/30 border-fg/10 bg-fg/5 rounded-lg border py-1.5 text-sm outline-none transition-colors focus:border-primary-500/50 focus:bg-primary-500/5",
  {
    variants: {
      width: {
        full: "w-full pr-8 pl-9",
        fixed: "w-40 pr-8 pl-3 lg:w-48",
      },
    },
    defaultVariants: {
      width: "full",
    },
  }
);

export type SearchInputProps = VariantProps<typeof searchInput>;

export const closeButton = cva("text-fg/40 hover:bg-fg/10 hover:text-fg rounded p-1 transition-colors", {
  variants: {
    position: {
      absolute: "absolute right-2",
      static: "",
    },
  },
  defaultVariants: {
    position: "absolute",
  },
});

export type CloseButtonProps = VariantProps<typeof closeButton>;

export const musicBadge = cva("absolute rounded-full p-1 shadow-lg ring-1", {
  variants: {
    position: {
      bottomRight: "-right-1 -bottom-1",
    },
    color: {
      primary: "bg-surface/90 ring-primary-500/30",
    },
  },
  defaultVariants: {
    position: "bottomRight",
    color: "primary",
  },
});

export type MusicBadgeProps = VariantProps<typeof musicBadge>;
