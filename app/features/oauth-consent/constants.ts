export const CONSENT = {
  title: "Authorize access",
  allow: "Allow",
  deny: "Deny",
  missing: "Missing or invalid authorization request.",
  loadError: "This authorization request is invalid or has expired.",
  loading: "Loading…",
  scopesLabel: "This will allow it to:",
  scopeDescriptions: {
    mcp: "Use Synthseek on your behalf (search, downloads, library and the settings your role can access).",
  } as Record<string, string>,
} as const;
