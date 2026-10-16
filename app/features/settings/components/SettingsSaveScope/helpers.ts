import type { SaveEntry } from "./types";

export function sameEntryState(previous: SaveEntry | undefined, next: SaveEntry): boolean {
  return (
    previous !== undefined &&
    previous.label === next.label &&
    previous.isDirty === next.isDirty &&
    previous.isSaving === next.isSaving &&
    previous.saveDisabled === next.saveDisabled
  );
}

export function leavesPage(href: string, currentPathname: string): boolean {
  return new URL(href, window.location.origin).pathname !== currentPathname;
}

export function internalHrefOf(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  if (!(event.target instanceof Element)) return null;
  const anchor = event.target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return null;
  const url = new URL(anchor.href, window.location.origin);
  if (url.origin !== window.location.origin) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

export function dirtyLabels(entries: readonly SaveEntry[]): string[] {
  return [...new Set(entries.map((entry) => entry.label).filter((label): label is string => label !== null))];
}

export async function saveEach(entries: readonly SaveEntry[]): Promise<boolean> {
  let saved = true;
  for (const entry of entries) {
    try {
      await entry.save();
    } catch {
      saved = false;
    }
  }
  return saved;
}
