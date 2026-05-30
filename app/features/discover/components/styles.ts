import { cn } from "@utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

export const NAV_BUTTON_CLASSES = cn(
  "absolute top-1/2 z-20 -translate-y-1/2",
  "bg-surface/80 hover:bg-surface flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm sm:h-12 sm:w-12",
  "border-fg/10 border shadow-lg"
);

export const glassPanelCard = cva("glass-panel relative flex flex-col rounded-xl p-4", {
  variants: {
    height: {
      full: "h-full",
      auto: "",
    },
    width: {
      full: "w-full",
      auto: "",
    },
  },
  defaultVariants: {
    height: "full",
    width: "auto",
  },
});

export type GlassPanelCardProps = VariantProps<typeof glassPanelCard>;

export const skeletonPulse = cva("bg-fg/10 animate-pulse rounded", {
  variants: {
    size: {
      xs: "h-3",
      sm: "h-4",
      md: "h-5",
      lg: "h-6",
      xl: "h-20",
    },
    width: {
      auto: "",
      full: "w-full",
      sm: "w-20",
      md: "w-28",
      lg: "w-36",
      xl: "w-48",
    },
  },
  defaultVariants: {
    size: "md",
    width: "auto",
  },
});

export type SkeletonPulseProps = VariantProps<typeof skeletonPulse>;

export const sectionHeader = cva("flex items-center justify-between", {
  variants: {
    spacing: {
      sm: "mb-3",
      md: "mb-4",
    },
  },
  defaultVariants: {
    spacing: "md",
  },
});

export const seeAllLink = cva("font-medium transition-colors", {
  variants: {
    size: {
      sm: "text-sm",
      xs: "text-xs",
    },
    color: {
      primary: "text-primary-400 hover:text-primary-300",
    },
  },
  defaultVariants: {
    size: "sm",
    color: "primary",
  },
});

export type SectionHeaderProps = VariantProps<typeof sectionHeader>;
export type SeeAllLinkProps = VariantProps<typeof seeAllLink>;

export const listItem = cva("group flex items-center gap-3 rounded-lg transition-all", {
  variants: {
    variant: {
      default: "border-fg/10 bg-surface/20 border p-3",
      ghost: "",
    },
    hover: {
      lift: "hover:bg-surface/30 hover:shadow-md",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    hover: "lift",
  },
});

export type ListItemProps = VariantProps<typeof listItem>;

export const statCard = cva("bg-fg/5 flex flex-col items-center justify-center rounded-xl text-center", {
  variants: {
    size: {
      sm: "gap-1 p-2",
      md: "gap-1 p-3",
      lg: "p-6",
    },
    border: {
      default: "border-fg/10 border",
      none: "",
    },
  },
  defaultVariants: {
    size: "lg",
    border: "none",
  },
});

export type StatCardProps = VariantProps<typeof statCard>;

export const gridLayout = cva("grid gap-3", {
  variants: {
    cols: {
      2: "grid-cols-2",
      3: "grid-cols-3",
      auto: "grid-flow-dense auto-rows-[100px] grid-cols-2",
    },
  },
  defaultVariants: {
    cols: 3,
  },
});

export type GridLayoutProps = VariantProps<typeof gridLayout>;

export const categoryCard = cva(
  "group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300",
  {
    variants: {
      size: {
        small: "row-span-1",
        medium: "row-span-2",
      },
      hover: {
        scale: "hover:scale-[1.02] hover:shadow-lg",
      },
    },
    defaultVariants: {
      size: "small",
      hover: "scale",
    },
  }
);

export type CategoryCardProps = VariantProps<typeof categoryCard>;

export const cardOverlay = cva("absolute inset-0", {
  variants: {
    gradient: {
      dark: "bg-gradient-to-t from-black/80 via-black/40 to-transparent",
      light: "bg-gradient-to-t from-black/60 to-transparent",
    },
  },
  defaultVariants: {
    gradient: "dark",
  },
});

export type CardOverlayProps = VariantProps<typeof cardOverlay>;

export const cardContent = cva("absolute flex flex-col justify-end p-3", {
  variants: {
    position: {
      bottom: "inset-x-0 bottom-0",
      full: "inset-0",
    },
  },
  defaultVariants: {
    position: "bottom",
  },
});

export type CardContentProps = VariantProps<typeof cardContent>;

export const artistCard = cva("group relative cursor-pointer overflow-hidden transition-all duration-300", {
  variants: {
    rounded: {
      lg: "rounded-lg",
      xl: "rounded-xl",
    },
    hover: {
      lift: "hover:-translate-y-1 hover:shadow-xl",
    },
  },
  defaultVariants: {
    rounded: "xl",
    hover: "lift",
  },
});

export type ArtistCardProps = VariantProps<typeof artistCard>;

export const hoverBorder = cva("absolute inset-0 border-2 border-transparent transition-colors duration-300", {
  variants: {
    color: {
      primary: "group-hover:border-primary-500/50",
    },
    rounded: {
      lg: "rounded-lg",
      xl: "rounded-xl",
    },
  },
  defaultVariants: {
    color: "primary",
    rounded: "lg",
  },
});

export type HoverBorderProps = VariantProps<typeof hoverBorder>;

export const topArtistsContainer = cva("mt-6 flex flex-1 flex-col border-t border-white/10 pt-6", {
  variants: {},
  defaultVariants: {},
});

export type TopArtistsContainerProps = VariantProps<typeof topArtistsContainer>;

export const scrollableGrid = cva("custom-scrollbar grid flex-1 content-start overflow-y-auto", {
  variants: {
    cols: {
      2: "grid-cols-2 gap-x-6 gap-y-3",
    },
  },
  defaultVariants: {
    cols: 2,
  },
});

export type ScrollableGridProps = VariantProps<typeof scrollableGrid>;

export const categoryPlaceholder = cva(
  "flex h-full w-full items-center justify-center bg-linear-to-br from-primary-500/30 to-accent-500/30",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type CategoryPlaceholderProps = VariantProps<typeof categoryPlaceholder>;

export const cardBottomContent = cva("absolute right-0 bottom-0 left-0 z-10 p-3 sm:p-4", {
  variants: {},
  defaultVariants: {},
});

export type CardBottomContentProps = VariantProps<typeof cardBottomContent>;

export const albumThumbnail = cva("relative shrink-0 overflow-hidden rounded", {
  variants: {
    size: {
      sm: "h-10 w-10 sm:h-12 sm:w-12",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export type AlbumThumbnailProps = VariantProps<typeof albumThumbnail>;

export const trendingBadgeContainer = cva("absolute z-10 flex items-center gap-1 sm:gap-1.5", {
  variants: {
    position: {
      topLeft: "top-3 left-3 sm:top-4 sm:left-4",
    },
  },
  defaultVariants: {
    position: "topLeft",
  },
});

export type TrendingBadgeContainerProps = VariantProps<typeof trendingBadgeContainer>;

export const cardBottomContentLg = cva("absolute right-0 bottom-0 left-0 z-10 p-3 sm:p-4 lg:p-5", {
  variants: {},
  defaultVariants: {},
});

export type CardBottomContentLgProps = VariantProps<typeof cardBottomContentLg>;

export const skeletonListItem = cva("border-fg/10 bg-surface/20 flex items-center gap-3 rounded-lg border p-3", {
  variants: {},
  defaultVariants: {},
});

export type SkeletonListItemProps = VariantProps<typeof skeletonListItem>;

export const sidebarContainer = cva("flex flex-col gap-4 sm:pl-4", {
  variants: {
    position: {
      absolute: "lg:absolute lg:top-0 lg:right-0 lg:bottom-0 lg:w-[30%]",
    },
  },
  defaultVariants: {
    position: "absolute",
  },
});

export type SidebarContainerProps = VariantProps<typeof sidebarContainer>;

export const playIcon = cva("text-primary-400 shrink-0 fill-current h-3 w-3 sm:h-3.5 sm:w-3.5", {
  variants: {},
  defaultVariants: {},
});

export type PlayIconProps = VariantProps<typeof playIcon>;
