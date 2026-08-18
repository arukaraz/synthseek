import { z } from "zod";
import changelog from "../../../../changelog.json";

const CalloutLevelSchema = z.enum(["important", "warning", "note"]);
const ItemCategorySchema = z.enum(["feature", "fix", "improvement"]);

const SectionSchema = z.object({
  heading: z.string().optional(),
  category: ItemCategorySchema.optional(),
  items: z.array(z.string()).optional(),
  body: z.string().optional(),
});

const VersionSchema = z.object({
  version: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.string(),
  title: z.string().optional(),
  sections: z.array(SectionSchema).optional(),
  callouts: z.array(z.object({ level: CalloutLevelSchema, body: z.string() })).optional(),
  issues: z.array(z.number()).optional(),
});

const ChangelogSchema = z.object({
  schemaVersion: z.number(),
  versions: z.array(VersionSchema).min(1),
});

export type CalloutLevel = z.infer<typeof CalloutLevelSchema>;
export type ItemCategory = z.infer<typeof ItemCategorySchema>;
export type ChangelogSection = z.infer<typeof SectionSchema>;
export type ChangelogVersion = z.infer<typeof VersionSchema>;

const parsed = ChangelogSchema.parse(changelog);

const CALLOUT_VARIANT: Record<CalloutLevel, "info" | "warning" | "danger"> = {
  note: "info",
  important: "info",
  warning: "warning",
};

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  feature: "Feature",
  fix: "Fix",
  improvement: "Improved",
};

const CATEGORY_CLASS: Record<ItemCategory, string> = {
  feature: "bg-primary-500/15 text-primary-400",
  fix: "bg-destructive-vivid/15 text-destructive-vivid",
  improvement: "bg-secondary-400/15 text-secondary-400",
};

export function calloutVariant(level: CalloutLevel) {
  return CALLOUT_VARIANT[level];
}

export function categoryLabel(category: ItemCategory | undefined): string {
  return category ? CATEGORY_LABEL[category] : CATEGORY_LABEL.feature;
}

export function categoryClass(category: ItemCategory | undefined): string {
  return category ? CATEGORY_CLASS[category] : CATEGORY_CLASS.feature;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day} ${year}`;
}

export function anchorFor(version: string): string {
  return `v-${version.replace(/\./g, "-")}`;
}

export function getVersions(): ChangelogVersion[] {
  return parsed.versions;
}
