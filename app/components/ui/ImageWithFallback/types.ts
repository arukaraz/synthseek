import type { LucideIcon } from "lucide-react";

export type ImagePlaceholderSize = "sm" | "md" | "lg";

export interface BaseImageWithFallbackProps {
  src?: string | null;
  alt: string;
  fallbackIcon?: LucideIcon;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export interface FillModeProps extends BaseImageWithFallbackProps {
  fill: true;
  sizes: string;
  width?: never;
  height?: never;
  placeholderSize?: never;
}

export interface FixedSizeProps extends BaseImageWithFallbackProps {
  fill?: false;
  width: number;
  height: number;
  sizes?: string;
  placeholderSize?: ImagePlaceholderSize;
}

export type ImageWithFallbackProps = FillModeProps | FixedSizeProps;

export interface FallbackIconProps {
  Icon: LucideIcon;
  size: "fill";
}
