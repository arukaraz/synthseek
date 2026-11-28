import type { TFunction } from "i18next";

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

export function spokenDuration(t: TFunction<"player">, seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / SECONDS_PER_HOUR);
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const rest = total % SECONDS_PER_MINUTE;
  const parts: string[] = [];
  if (hours > 0) parts.push(t("spoken.hours", { count: hours }));
  if (minutes > 0) parts.push(t("spoken.minutes", { count: minutes }));
  if (rest > 0 || parts.length === 0) parts.push(t("spoken.seconds", { count: rest }));
  return parts.join(" ");
}

export function spokenPosition(t: TFunction<"player">, elapsed: number, total: number): string {
  return t("spoken.seek", { elapsed: spokenDuration(t, elapsed), total: spokenDuration(t, total) });
}

export function spokenVolume(t: TFunction<"player">, fraction: number): string {
  return t("spoken.volume", { percent: Math.round(fraction * 100) });
}
