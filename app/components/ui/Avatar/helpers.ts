export function firstInitial(username: string | undefined): string {
  const trimmed = username?.trim() ?? "";
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : "";
}
