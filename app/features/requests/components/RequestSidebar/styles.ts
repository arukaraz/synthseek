import { cva, type VariantProps } from "class-variance-authority";

export const sidebarContainer = cva(
  "border-fg/10 bg-surface/30 flex h-full flex-col overflow-hidden border-r sm:bg-surface/20 sm:backdrop-blur-sm",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type SidebarContainerProps = VariantProps<typeof sidebarContainer>;

export const sidebarList = cva("custom-scrollbar flex-1 overflow-y-auto", {
  variants: {},
  defaultVariants: {},
});

export type SidebarListProps = VariantProps<typeof sidebarList>;

export const sidebarItem = cva(
  "group/sidebar-item border-fg/5 hover:bg-fg/5 relative flex w-full flex-col gap-1.5 border-b px-4 py-3 text-left transition-colors active:bg-primary-500/10",
  {
    variants: {},
    defaultVariants: {},
  }
);

export type SidebarItemProps = VariantProps<typeof sidebarItem>;
