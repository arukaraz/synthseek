import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type PatchNotes = RouterOutputs["updates"]["patchNotes"];
export type ChangelogEntry = PatchNotes["versions"][number];
export type ChangelogSection = ChangelogEntry["sections"][number];
export type ChangelogCategory = NonNullable<ChangelogSection["category"]>;
export type ChangelogCallout = NonNullable<ChangelogEntry["callouts"]>[number];
export type UpdateCheckResult = RouterOutputs["updates"]["check"];

export type EntryVariant = "latest" | "new" | "current" | "past";

export interface NoteLine {
  category?: ChangelogCategory;
  text: string;
}

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; href: string };

export interface InlineMarkdownProps {
  text: string;
}

export interface TimelineEntryProps {
  entry: ChangelogEntry;
  variant: EntryVariant;
}

export interface EntryBodyProps {
  entry: ChangelogEntry;
}
