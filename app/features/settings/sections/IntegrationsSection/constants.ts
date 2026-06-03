import type { Affix, SlskdHealth, SlskdStatusTone } from "./types";

export const AFFIX_OPTIONS: ReadonlyArray<{ value: Affix; label: string }> = [
  { value: "off", label: "Off" },
  { value: "prefix", label: "Prefix" },
  { value: "suffix", label: "Suffix" },
];

export const SLSKD_STATUS_LABEL: Record<SlskdHealth, string> = {
  healthy: "Healthy",
  unhealthy: "Unhealthy",
  not_configured: "Not configured",
};

export const SLSKD_STATUS_TONE: Record<SlskdHealth, SlskdStatusTone> = {
  healthy: "success",
  unhealthy: "danger",
  not_configured: "muted",
};

export const BANNED_UPLOADERS_TOOLTIP_TRIGGER_LABEL = "About banned uploaders";

export const BANNED_UPLOADERS_TOOLTIP_WHAT =
  "Soulseek usernames added here are blocked as download sources. Synthseek skips their files and downloads from another source instead. Add anyone who keeps sending bad files or failing to deliver.";

export const BANNED_UPLOADERS_TOOLTIP_AUTO =
  "Synthseek can also add uploaders here for you. When a user's transfers fail too many times in a row they are banned automatically. Only real transfer failures count, not filename mismatches, and the limit is configured in Engine > Search (set it to 0 to turn auto-ban off).";
