export interface StoryRow {
  key: string;
  label: string;
  value: string;
}

export interface StoryPage {
  key: string;
  label: string;
  headline: string;
  detail: string | null;
  cover: string | null;
  rows: readonly StoryRow[];
}
