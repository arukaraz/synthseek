import { SETTINGS_PAGE_BY_ID, SETTINGS_PAGES, SETTINGS_TABS } from "@features/settings/constants";
import type { SettingsTabbedPageId } from "@features/settings/types";

import type { PageTitleRoute } from "./types";

const TABBED_SETTINGS_PAGES: readonly SettingsTabbedPageId[] = [
  "customization",
  "connections",
  "download",
  "library",
  "maintenance",
  "releases",
  "system",
];

const SETTINGS_PAGE_ROUTES: readonly PageTitleRoute[] = SETTINGS_PAGES.map(
  (page): PageTitleRoute => ({ path: page.href, exact: true, key: `settings:${page.labelKey}` })
);

const SETTINGS_TAB_ROUTES: readonly PageTitleRoute[] = TABBED_SETTINGS_PAGES.flatMap((id) =>
  SETTINGS_TABS[id].map(
    (tab): PageTitleRoute => ({
      path: tab.href,
      exact: true,
      key: `settings:${tab.labelKey}`,
      parentKey: `settings:${SETTINGS_PAGE_BY_ID[id].labelKey}`,
    })
  )
);

export const PAGE_TITLE_ROUTES: readonly PageTitleRoute[] = [
  { path: "/", exact: true, key: "components:header.discover" },
  { path: "/discover", exact: false, key: "components:header.discover" },
  { path: "/library", exact: false, key: "components:header.library" },
  { path: "/requests", exact: false, key: "components:header.requests" },
  { path: "/search", exact: false, key: "components:header.search" },
  { path: "/login", exact: false, key: "components:pageTitle.login" },
  { path: "/setup", exact: false, key: "components:pageTitle.setup" },
  { path: "/oauth/consent", exact: false, key: "components:pageTitle.consent" },
  { path: "/settings", exact: false, key: "components:header.settings" },
  ...SETTINGS_PAGE_ROUTES,
  ...SETTINGS_TAB_ROUTES,
];
