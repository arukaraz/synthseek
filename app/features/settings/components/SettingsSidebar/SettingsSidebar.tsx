"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useMaintenanceCounts } from "@hooks/api/queries/useMaintenanceCounts";
import { useSystemStatus } from "@hooks/api/queries/useSystemStatus";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";

import {
  BUILD_VERSION,
  MAINTENANCE_ATTENTION_KEYS,
  SERVER_PAGES,
  SETTINGS_PAGE_BY_ID,
  YOU_PAGES,
} from "../../constants";
import { isPathWithin } from "../../helpers";
import { sidebar, sidebarBottom, sidebarFooter, sidebarGroupHeader } from "../../styles";
import type { SettingsPage } from "../../types";
import { useSettingsNavigate } from "../SettingsSaveScope";
import {
  SETTINGS_SEARCH_ENTRIES,
  SettingsSearchBox,
  SettingsSearchResults,
  entryHref,
  searchSettings,
} from "../SettingsSearch";
import { SidebarNavLink } from "./SidebarNavLink";
import type { SettingsSidebarProps, SidebarAttention } from "./types";

export function SettingsSidebar({ className, query, onQueryChange }: SettingsSidebarProps) {
  const { t } = useTranslation("settings");
  const pathname = usePathname();
  const { isAdmin } = useAuthContext();
  const navigate = useSettingsNavigate();
  const counts = useMaintenanceCounts(isAdmin);
  const status = useSystemStatus(isAdmin);

  const attention: SidebarAttention = {
    problems: (status.data?.problems.length ?? 0) > 0,
    maintenance: MAINTENANCE_ATTENTION_KEYS.some((key) => (counts.data?.[key] ?? 0) > 0),
  };
  const results = query.trim().length > 0 ? searchSettings(query, SETTINGS_SEARCH_ENTRIES, t, isAdmin) : null;

  const pick = (href: string) => {
    onQueryChange("");
    navigate(href);
  };

  const renderLink = (page: SettingsPage) => (
    <SidebarNavLink
      key={page.id}
      page={page}
      active={isPathWithin(pathname, page.href)}
      attention={page.badge ? attention[page.badge] : false}
    />
  );

  return (
    <nav aria-label={t("shell.sidebar.ariaLabel")} className={cn(sidebar(), className)}>
      <SettingsSearchBox
        value={query}
        onChange={onQueryChange}
        onSubmit={() => {
          const first = results?.[0];
          if (first) pick(entryHref(first.entry));
        }}
      />
      {results ? (
        <SettingsSearchResults query={query} results={results} onPick={(result) => pick(entryHref(result.entry))} />
      ) : (
        <>
          <span className={sidebarGroupHeader()}>{t("shell.sidebar.groups.you")}</span>
          {YOU_PAGES.map(renderLink)}
          {isAdmin ? (
            <>
              <span className={sidebarGroupHeader()}>{t("shell.sidebar.groups.server")}</span>
              {SERVER_PAGES.map(renderLink)}
            </>
          ) : null}
          <div className={sidebarBottom()}>
            {renderLink(SETTINGS_PAGE_BY_ID.about)}
            <span className={sidebarFooter()}>{t("shell.sidebar.version", { version: BUILD_VERSION })}</span>
          </div>
        </>
      )}
    </nav>
  );
}
