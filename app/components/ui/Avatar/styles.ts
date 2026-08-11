import type { AvatarSize } from "./types";

export const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export const innerSizeClasses: Record<AvatarSize, string> = {
  sm: "h-[calc(100%-2px)] w-[calc(100%-2px)]",
  md: "h-[calc(100%-2px)] w-[calc(100%-2px)]",
  lg: "h-[calc(100%-3px)] w-[calc(100%-3px)]",
};

export const initialSizeClasses: Record<AvatarSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export const avatarRing = "from-primary-500 to-accent-500 relative rounded-full bg-linear-to-br p-0.5";

export const avatarInner = "flex h-full w-full items-center justify-center overflow-hidden rounded-full";

export const avatarFallbackGradient = "from-primary-500 to-accent-500 bg-linear-to-br";

export const avatarImage = "h-full w-full rounded-full object-cover";

export const avatarInitial = "font-bold text-white";
