export function nameAfterVisibleText(name: string, ...visibleText: ReadonlyArray<string | null | undefined>): string {
  const shown = visibleText.filter((part): part is string => part !== null && part !== undefined && part !== "");
  return [...shown, name].join(" ");
}
