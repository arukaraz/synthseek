import type { HTMLAttributes } from "react";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}
