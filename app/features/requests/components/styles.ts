import { cva, type VariantProps } from "class-variance-authority";

export const requestsView = cva("from-primary-500/5 via-primary-400/0 relative flex h-full flex-col bg-linear-to-t", {
  variants: {},
  defaultVariants: {},
});

export type RequestsViewProps = VariantProps<typeof requestsView>;

export const tableContainer = cva(
  "border-fg/10 bg-surface/30 overflow-hidden rounded-xl border sm:bg-surface/20 sm:backdrop-blur-sm",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type TableContainerProps = VariantProps<typeof tableContainer>;

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

export const toolbarContainer = cva(
  "border-fg/5 flex items-center justify-between gap-3 border-b px-3 py-2.5 sm:px-4",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type ToolbarContainerProps = VariantProps<typeof toolbarContainer>;

export const searchInput = cva(
  "text-fg placeholder-fg/30 border-fg/10 bg-fg/5 h-9 rounded-lg border text-sm outline-none transition-colors focus:border-primary-500/50 focus:bg-primary-500/5 w-full pr-8 pl-9 sm:w-44 lg:w-56",
  {
    variants: {},
    defaultVariants: {},
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

export const mobileSearchOpenButton = cva(
  "text-fg/40 hover:bg-fg/10 hover:text-fg/80 flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
);
