import { cva } from "class-variance-authority";

export const settingsLink = cva(
  "focus-visible:ring-primary-400 relative inline-flex shrink-0 items-center justify-center transition-colors outline-none focus-visible:ring-2",
  {
    variants: {
      variant: {
        gear: "text-fg/60 hover:text-fg hover:bg-fg/5 size-9 rounded-xl [&>svg]:size-[18px]",
        avatar: "rounded-full",
      },
    },
  }
);

export const settingsBadgeIcon = cva("size-3.5");
