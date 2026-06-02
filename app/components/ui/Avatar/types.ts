import type { HTMLAttributes, ReactNode } from "react";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize;
  imageUrl?: string | null;
  username?: string;
  children?: ReactNode;
}
