import type { MonitorScope } from "../types";

export function isAlbumScope(monitor: MonitorScope): boolean {
  return monitor === "album";
}

export function nextRadioIndex(key: string, currentIndex: number, count: number): number | null {
  if (key === "ArrowDown" || key === "ArrowRight") {
    return (currentIndex + 1) % count;
  }
  if (key === "ArrowUp" || key === "ArrowLeft") {
    return (currentIndex - 1 + count) % count;
  }
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return count - 1;
  }
  return null;
}
