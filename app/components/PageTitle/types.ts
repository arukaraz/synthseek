import type { ParseKeys } from "i18next";

export type PageTitleKey = `components:${ParseKeys<"components">}` | `settings:${ParseKeys<"settings">}`;

export interface PageTitleRoute {
  path: string;
  exact: boolean;
  key: PageTitleKey;
  parentKey?: PageTitleKey;
}
