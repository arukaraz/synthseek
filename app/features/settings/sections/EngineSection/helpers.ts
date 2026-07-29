import type { ParseKeys } from "i18next";

const QUARANTINE_SOURCE_KEYS: Partial<Record<string, ParseKeys<"settings">>> = {
  slskd: "quarantine.source.slskd",
  ytdlp: "quarantine.source.ytdlp",
};

export function quarantineSourceKey(source: string): ParseKeys<"settings"> | null {
  return QUARANTINE_SOURCE_KEYS[source] ?? null;
}

export function truncateMiddle(value: string, max: number): string {
  if (value.length <= max) return value;
  const tail = Math.floor((max - 1) / 2);
  const head = max - 1 - tail;
  return `${value.slice(0, head)}…${value.slice(value.length - tail)}`;
}
