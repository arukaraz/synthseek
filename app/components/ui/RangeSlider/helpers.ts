function share(min: number, max: number, value: number): number {
  if (max <= min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

export function rangeFillInset(min: number, max: number, low: number, high: number): string {
  return `${share(min, max, low)}% ${100 - share(min, max, high)}%`;
}

export function lowThumbLeads(min: number, max: number, low: number): boolean {
  return low - min > (max - min) / 2;
}
