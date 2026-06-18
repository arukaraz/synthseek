import type { RequestStatus } from "@api/__generated__/types";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import type { KeyboardEvent } from "react";

export function handleCardActivationKey(event: KeyboardEvent<HTMLElement>, onOpen: () => void): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onOpen();
  }
}

export function cardInitials(name: string): string {
  const words = name
    .trim()
    .split(" ")
    .filter((word) => word.length > 0);
  if (words.length === 0) return "?";
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].slice(0, 2).toUpperCase();
}

export function statusDotClass(status: RequestStatus): string {
  return REQUEST_STATUS_CONFIG[status].glowColor;
}

export function albumMetaLine(year: number | null, quality: string | null): string | null {
  const parts: string[] = [];
  if (year !== null) parts.push(String(year));
  if (quality) parts.push(quality);
  if (parts.length === 0) return null;
  return parts.join(" · ");
}

export function mosaicTiles(images: string[], image: string | null): string[] {
  if (images.length > 0) return images.slice(0, 4);
  if (image) return [image];
  return [];
}
