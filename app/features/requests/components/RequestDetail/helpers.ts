import { titleCase } from "@utils/formatters";

export function formatDelegatedTo(delegatedTo: string | null): string | null {
  const trimmed = delegatedTo?.trim();
  if (!trimmed) return null;
  return titleCase(trimmed);
}
