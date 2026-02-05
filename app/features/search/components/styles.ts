import { cva, type VariantProps } from "class-variance-authority";

export const resultCard = cva("group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300", {
  variants: {
    hover: {
      lift: "hover:-translate-y-1 hover:shadow-xl",
      scale: "hover:scale-[1.02]",
    },
  },
  defaultVariants: {
    hover: "lift",
  },
});

export type ResultCardProps = VariantProps<typeof resultCard>;

export const cardImagePlaceholder = cva("flex h-full w-full items-center justify-center bg-gradient-to-br", {
  variants: {
    gradient: {
      primary: "from-primary-500/30 to-accent-500/30",
      subtle: "from-primary-500/20 to-accent-500/20",
    },
  },
  defaultVariants: {
    gradient: "primary",
  },
});

export type CardImagePlaceholderProps = VariantProps<typeof cardImagePlaceholder>;

export const cardInfo = cva("absolute inset-x-0 bottom-0 p-3", {
  variants: {
    gradient: {
      dark: "bg-gradient-to-t from-black/90 via-black/60 to-transparent",
    },
  },
  defaultVariants: {
    gradient: "dark",
  },
});

export type CardInfoProps = VariantProps<typeof cardInfo>;

export const cardHoverBorder = cva(
  "absolute inset-0 rounded-lg border-2 border-transparent transition-all duration-300",
  {
    variants: {
      color: {
        primary: "group-hover:border-primary-500/50 group-hover:glow-primary",
      },
    },
    defaultVariants: {
      color: "primary",
    },
  }
);

export type CardHoverBorderProps = VariantProps<typeof cardHoverBorder>;

export const configHeader = cva("absolute inset-0 flex items-center justify-center rounded-t-2xl bg-gradient-to-br", {
  variants: {
    gradient: {
      primary: "from-primary-500/30 to-accent-500/30",
    },
  },
  defaultVariants: {
    gradient: "primary",
  },
});

export type ConfigHeaderProps = VariantProps<typeof configHeader>;

export const browserModal = cva("relative flex h-[85vh] max-h-[900px] w-full flex-col overflow-hidden rounded-2xl", {
  variants: {
    bg: {
      glass: "bg-surface/95 backdrop-blur-2xl",
    },
  },
  defaultVariants: {
    bg: "glass",
  },
});

export type BrowserModalProps = VariantProps<typeof browserModal>;

export const contentList = cva("flex min-h-0 flex-1 flex-col overflow-y-auto p-4 pt-0", {
  variants: {},
  defaultVariants: {},
});

export type ContentListProps = VariantProps<typeof contentList>;

export const contentListItem = cva("group flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-all", {
  variants: {
    hover: {
      default: "hover:bg-fg/5",
    },
  },
  defaultVariants: {
    hover: "default",
  },
});

export type ContentListItemProps = VariantProps<typeof contentListItem>;

export const itemImage = cva("size-16 rounded-md border bg-gradient-to-br", {
  variants: {
    gradient: {
      primary: "from-primary-500/20 to-accent-500/20 border-primary-500/20",
    },
  },
  defaultVariants: {
    gradient: "primary",
  },
});

export type ItemImageProps = VariantProps<typeof itemImage>;

export const resultsView = cva("from-primary-500/5 via-primary-400/0 relative flex h-full flex-col bg-gradient-to-t", {
  variants: {},
  defaultVariants: {},
});

export type ResultsViewProps = VariantProps<typeof resultsView>;

export const modalContainer = cva("h-modal-max glass-intense !flex flex-col gap-0 overflow-hidden p-0 shadow-2xl", {
  variants: {
    size: {
      lg: "max-w-4xl",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export type ModalContainerProps = VariantProps<typeof modalContainer>;

export const loadingSpinner = cva("animate-spin rounded-full border-4 border-t-white", {
  variants: {
    size: {
      sm: "h-6 w-6",
      md: "h-8 w-8",
    },
    color: {
      default: "border-fg/20",
    },
  },
  defaultVariants: {
    size: "md",
    color: "default",
  },
});

export type LoadingSpinnerProps = VariantProps<typeof loadingSpinner>;

export const backButton = cva("flex items-center gap-2 text-sm transition-colors", {
  variants: {
    color: {
      muted: "text-fg/60 hover:text-fg",
    },
    spacing: {
      mb3: "mb-3",
    },
  },
  defaultVariants: {
    color: "muted",
    spacing: "mb3",
  },
});

export type BackButtonProps = VariantProps<typeof backButton>;

export const heroContentContainer = cva("absolute right-0 bottom-0 left-0 z-10 p-4 sm:p-6", {
  variants: {},
  defaultVariants: {},
});

export type HeroContentContainerProps = VariantProps<typeof heroContentContainer>;

export const cardTitle = cva("text-overlay-fg line-clamp-2 leading-tight font-semibold mb-1 text-base sm:text-lg", {
  variants: {},
  defaultVariants: {},
});

export type CardTitleProps = VariantProps<typeof cardTitle>;

export const trackListContainer = cva("group hover:bg-fg/5 flex items-center gap-4 rounded-lg p-3 transition-all", {
  variants: {},
  defaultVariants: {},
});

export type TrackListContainerProps = VariantProps<typeof trackListContainer>;

export const filterTabsContainer = cva("mb-4 flex items-center gap-2 overflow-x-auto px-4 sm:px-6", {
  variants: {},
  defaultVariants: {},
});

export type FilterTabsContainerProps = VariantProps<typeof filterTabsContainer>;
