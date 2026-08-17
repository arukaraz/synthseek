import i18n from "@locale";

export function formatYear(dateString: string | null | undefined): string {
  if (!dateString) return "";
  return dateString.split("-")[0] || "";
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return i18n.t("common:relativeTime.yearsAgo", { count: years });
  if (months > 0) return i18n.t("common:relativeTime.monthsAgo", { count: months });
  if (weeks > 0) return i18n.t("common:relativeTime.weeksAgo", { count: weeks });
  if (days > 0) return i18n.t("common:relativeTime.daysAgo", { count: days });
  if (hours > 0) return i18n.t("common:relativeTime.hoursAgo", { count: hours });
  if (minutes > 0) return i18n.t("common:relativeTime.minutesAgo", { count: minutes });
  return i18n.t("common:relativeTime.justNow");
}

export function formatTimeUntil(date: Date): string {
  const diff = date.getTime() - Date.now();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return i18n.t("common:relativeTime.inYears", { count: years });
  if (months > 0) return i18n.t("common:relativeTime.inMonths", { count: months });
  if (weeks > 0) return i18n.t("common:relativeTime.inWeeks", { count: weeks });
  if (days > 0) return i18n.t("common:relativeTime.inDays", { count: days });
  if (hours > 0) return i18n.t("common:relativeTime.inHours", { count: hours });
  if (minutes > 0) return i18n.t("common:relativeTime.inMinutes", { count: minutes });
  return i18n.t("common:relativeTime.soon");
}

export function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return i18n.t("common:elapsed.seconds", { count: seconds });

  const hours = Math.floor(minutes / 60);
  if (hours < 1) return i18n.t("common:elapsed.minutes", { count: minutes });

  return i18n.t("common:elapsed.hours", { count: hours });
}

export function formatDuration(start: Date, end?: Date): string | null {
  if (!end) return null;

  const diff = end.getTime() - start.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString(i18n.language, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString(i18n.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(i18n.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(i18n.language, {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
  });
}

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${BYTE_UNITS[unitIndex]}`;
}

export function formatTrackDuration(durationMs: number): string {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function titleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
