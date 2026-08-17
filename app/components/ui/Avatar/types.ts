import type { ComponentProps, ReactNode } from "react";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends ComponentProps<"div"> {
  size?: AvatarSize;
  imageUrl?: string | null;
  username?: string;
  children?: ReactNode;
}
