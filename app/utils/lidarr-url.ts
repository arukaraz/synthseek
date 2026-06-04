export interface LidarrUrlValidation {
  ok: boolean;
  normalized: string;
  error?: string;
  warning?: string;
}

const INVALID_URL_ERROR = "Enter a full URL including http:// or https://, like http://host:port.";

const PATH_WARNING = "This looks like a page URL. The Lidarr URL is usually the base, like http://host:port.";

export function validateLidarrUrl(rawValue: string): LidarrUrlValidation {
  const trimmed = rawValue.trim();

  if (trimmed.length === 0) {
    return { ok: false, normalized: "", error: INVALID_URL_ERROR };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, normalized: trimmed, error: INVALID_URL_ERROR };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, normalized: trimmed, error: INVALID_URL_ERROR };
  }

  const normalized = stripTrailingSlash(parsed.href);
  const hasNonRootPath = parsed.pathname !== "/" && parsed.pathname !== "";

  if (hasNonRootPath) {
    return { ok: true, normalized, warning: PATH_WARNING };
  }

  return { ok: true, normalized };
}

function stripTrailingSlash(value: string): string {
  if (value.length > 1 && value.endsWith("/")) {
    return value.slice(0, -1);
  }
  return value;
}
