import { cva, type VariantProps } from "class-variance-authority";

export const triggerButton = cva("flex items-center gap-1.5 rounded-full pr-1 transition-all focus:outline-none", {
  variants: {
    hover: {
      default: "hover:bg-fg/5",
    },
    focus: {
      primary: "focus:ring-primary-500/50 focus:ring-2",
    },
  },
  defaultVariants: {
    hover: "default",
    focus: "primary",
  },
});

export type TriggerButtonProps = VariantProps<typeof triggerButton>;

export const menuContent = cva("w-64 rounded-xl bg-gradient-to-b p-1.5 shadow-2xl shadow-surface/50", {
  variants: {
    gradient: {
      primary: "from-primary-600/5 via-primary-600/5 to-accent-600/5",
    },
  },
  defaultVariants: {
    gradient: "primary",
  },
});

export type MenuContentProps = VariantProps<typeof menuContent>;

export const userInfoContainer = cva("relative flex items-center gap-3 rounded-lg px-3 py-3", {
  variants: {},
  defaultVariants: {},
});

export type UserInfoContainerProps = VariantProps<typeof userInfoContainer>;

export const menuItem = cva("flex cursor-pointer items-center justify-between rounded-lg px-3 py-2", {
  variants: {
    color: {
      default: "text-fg/90 focus:bg-fg/5 focus:text-fg",
      danger: "text-red-400 focus:bg-red-500/10 focus:text-red-400",
    },
    state: {
      disabled: "cursor-not-allowed opacity-50",
    },
  },
  defaultVariants: {
    color: "default",
  },
});

export type MenuItemProps = VariantProps<typeof menuItem>;

export const logoutItem = cva("flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 opacity-50", {
  variants: {
    color: {
      danger: "text-red-400 focus:bg-red-500/10 focus:text-red-400",
    },
  },
  defaultVariants: {
    color: "danger",
  },
});

export type LogoutItemProps = VariantProps<typeof logoutItem>;
