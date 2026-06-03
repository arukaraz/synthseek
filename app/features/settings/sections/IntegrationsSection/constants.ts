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
