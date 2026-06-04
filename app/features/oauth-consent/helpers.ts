import i18n from "@locale";

export function scopeLabel(scope: string): string {
  if (scope === "mcp") return i18n.t("auth:oauthConsent.scopes.mcp");
  return scope;
}
