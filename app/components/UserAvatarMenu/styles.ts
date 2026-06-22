import { cva, type VariantProps } from "class-variance-authority";

export const triggerButton = cva("flex items-center gap-1.5 rounded-full pr-1 transition-all focus:outline-none", {
  variants: {
    hover: {
      default: "hover:bg-fg/5",
    },
    focus: {
      primary: "focus-visible:ring-primary-500/50 focus-visible:ring-2",
    },
  },
  defaultVariants: {
    hover: "default",
    focus: "primary",
  },
});

export type TriggerButtonProps = VariantProps<typeof triggerButton>;

export const triggerAvatarWrapper = cva("relative inline-flex");

export const triggerBadge = cva(
  "ring-surface border-secondary-400 bg-secondary-600 text-secondary-foreground shadow-secondary-500/50 absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border shadow-md ring-2 motion-safe:animate-pulse"
);

export const menuContent = cva(
  "bg-surface-overlay/98 sm:bg-surface-overlay/95 w-64 rounded-xl bg-gradient-to-b p-1.5 shadow-2xl shadow-surface/50",
  {
    variants: {
      gradient: {
        primary: "from-primary-600/5 via-primary-600/5 to-accent-600/5",
      },
    },
    defaultVariants: {
      gradient: "primary",
    },
  }
);

export type MenuContentProps = VariantProps<typeof menuContent>;

export const headerBlock = cva("relative flex items-center gap-3 rounded-lg px-3 py-3");

export const headerIdentity = cva("flex min-w-0 flex-col gap-0.5");

export const headerNameRow = cva("flex min-w-0 items-center gap-1.5");

export const headerUsername = cva("text-fg min-w-0 truncate text-sm font-semibold");

export const headerEmail = cva("text-fg/60 truncate text-xs");

export const updateSection = cva("mt-1 flex flex-col gap-1.5 rounded-lg px-3 py-2.5", {
  variants: {
    tone: {
      info: "border-primary-500/20 bg-primary-500/10 border",
      breaking: "border-accent-500/40 bg-accent-500/15 border",
    },
  },
  defaultVariants: { tone: "info" },
});

export type UpdateSectionProps = VariantProps<typeof updateSection>;

export const updateStatusRow = cva("flex items-center gap-2");

export const updateGlyph = cva("h-4 w-4 shrink-0", {
  variants: {
    tone: {
      info: "text-secondary-400",
      breaking: "text-accent-300",
    },
  },
  defaultVariants: { tone: "info" },
});

export type UpdateGlyphProps = VariantProps<typeof updateGlyph>;

export const updateTitle = cva("text-fg/90 text-sm font-medium");

export const updateBreakingPrefix = cva(
  "bg-accent-500/20 text-accent-200 mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
);

export const updateCurrent = cva("text-fg/50 ml-auto shrink-0 text-xs");

export const patchNotesLink = cva(
  "text-primary-400 hover:text-primary-300 focus-visible:ring-primary-500/50 ml-6 w-fit rounded text-xs underline-offset-2 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
);

export const navItem = cva("text-fg/80 focus:bg-fg/5 focus:text-fg gap-2.5 py-2.5");

export const logoutItem = cva(
  "text-destructive-vivid hover:bg-destructive-vivid/10 hover:text-destructive-vivid focus:bg-destructive-vivid/10 focus:text-destructive-vivid active:bg-destructive-vivid/15 gap-2.5 py-2.5"
);
