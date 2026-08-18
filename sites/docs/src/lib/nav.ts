import { getCollection } from "astro:content";
import { GROUPS } from "../content.config";

export interface NavEntry {
  slug: string;
  href: string;
  title: string;
  blurb: string;
  group: (typeof GROUPS)[number];
  order: number;
}

export interface NavGroup {
  label: (typeof GROUPS)[number];
  entries: NavEntry[];
}

export const PATCH_NOTES: NavEntry = {
  slug: "patch-notes",
  href: "/patch-notes",
  title: "Patch Notes",
  blurb: "Every release, newest first.",
  group: "Reference",
  order: 99,
};

export async function getNavEntries(): Promise<NavEntry[]> {
  const collection = await getCollection("docs");
  const entries: NavEntry[] = collection.map((entry) => ({
    slug: entry.id,
    href: entry.id === "overview" ? "/" : `/${entry.id}`,
    title: entry.data.title,
    blurb: entry.data.blurb,
    group: entry.data.group,
    order: entry.data.order,
  }));
  return [...entries, PATCH_NOTES].sort((a, b) => a.order - b.order);
}

export function groupNav(entries: NavEntry[]): NavGroup[] {
  return GROUPS.map((label) => ({
    label,
    entries: entries.filter((entry) => entry.group === label),
  })).filter((group) => group.entries.length > 0);
}

export function siblingsOf(entries: NavEntry[], slug: string) {
  const index = entries.findIndex((entry) => entry.slug === slug);
  return {
    previous: index > 0 ? entries[index - 1] : null,
    next: index >= 0 && index < entries.length - 1 ? entries[index + 1] : null,
  };
}
