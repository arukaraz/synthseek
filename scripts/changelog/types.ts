export type ChangelogVersionType = "major" | "minor" | "patch";

export type ChangelogCalloutLevel = "important" | "warning" | "note";

export type ChangelogSectionCategory = "feature" | "fix" | "improvement" | "breaking" | "chore";

export interface ChangelogCallout {
  level: ChangelogCalloutLevel;
  body: string;
}

export interface ChangelogSection {
  heading?: string;
  category?: ChangelogSectionCategory;
  body?: string;
  items?: string[];
}

export interface ChangelogVersion {
  version: string;
  date: string;
  type: ChangelogVersionType;
  title: string;
  callouts?: ChangelogCallout[];
  sections?: ChangelogSection[];
  issues?: number[];
}

export interface Changelog {
  schemaVersion: number;
  versions: ChangelogVersion[];
}
