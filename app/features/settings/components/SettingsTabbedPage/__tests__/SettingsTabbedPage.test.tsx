import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import i18n from "@modules/i18n";

const state = vi.hoisted(() => ({
  isAdmin: true,
  pathname: "/settings/maintenance/review",
  countsEnabled: vi.fn(),
  counts: {
    review: 2,
    duplicates: 0,
    recycleBin: 78,
    quarantine: 12,
    systemStatus: 1,
    downloadedAlbums: 5,
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    prefetch: _prefetch,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    prefetch?: boolean;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: state.isAdmin, isLoading: false, currentUser: null }),
}));

vi.mock("@hooks/api/queries/useMaintenanceCounts", () => ({
  useMaintenanceCounts: (enabled: boolean) => {
    state.countsEnabled(enabled);
    return { data: enabled ? state.counts : undefined };
  },
}));

import { SETTINGS_PAGE_BY_ID, SETTINGS_TABS } from "../../../constants";
import { SettingsTabbedPage } from "../SettingsTabbedPage";

const t = i18n.getFixedT("en", "settings");

function tabs(title: string) {
  return within(screen.getByRole("navigation", { name: title })).getAllByRole("link");
}

beforeEach(() => {
  state.isAdmin = true;
  state.pathname = "/settings/maintenance/review";
  state.countsEnabled.mockReset();
});

describe("SettingsTabbedPage", () => {
  it("renders the page title, every tab and the page content", () => {
    render(
      <SettingsTabbedPage pageId="library">
        <p>tab body</p>
      </SettingsTabbedPage>
    );
    const title = t(SETTINGS_PAGE_BY_ID.library.labelKey);
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    const links = tabs(title);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(SETTINGS_TABS.library.map((tab) => tab.href));
    expect(links.map((link) => link.textContent)).toEqual(SETTINGS_TABS.library.map((tab) => t(tab.labelKey)));
    expect(screen.getByText("tab body")).toBeInTheDocument();
  });

  it("marks the tab of the current path", () => {
    state.pathname = "/settings/system/logs";
    render(<SettingsTabbedPage pageId="system">{null}</SettingsTabbedPage>);
    const links = tabs(t(SETTINGS_PAGE_BY_ID.system.labelKey));
    expect(links.map((link) => link.getAttribute("aria-current"))).toEqual([null, "page"]);
  });

  it("shows the maintenance counts above zero on their tabs for an admin", () => {
    render(<SettingsTabbedPage pageId="maintenance">{null}</SettingsTabbedPage>);
    expect(state.countsEnabled).toHaveBeenCalledWith(true);
    const links = tabs(t(SETTINGS_PAGE_BY_ID.maintenance.labelKey));
    const expected = SETTINGS_TABS.maintenance.map((tab) => {
      const count = tab.countKey ? state.counts[tab.countKey] : 0;
      return `${t(tab.labelKey)}${count > 0 ? count : ""}`;
    });
    expect(links.map((link) => link.textContent)).toEqual(expected);
    expect(expected.join("")).toContain("78");
  });

  it("does not ask for counts on another tabbed page", () => {
    state.pathname = "/settings/library/scan";
    render(<SettingsTabbedPage pageId="library">{null}</SettingsTabbedPage>);
    expect(state.countsEnabled).toHaveBeenCalledWith(false);
    expect(state.countsEnabled).not.toHaveBeenCalledWith(true);
  });

  it("does not ask for counts for a member", () => {
    state.isAdmin = false;
    render(<SettingsTabbedPage pageId="maintenance">{null}</SettingsTabbedPage>);
    expect(state.countsEnabled).toHaveBeenCalledWith(false);
    expect(state.countsEnabled).not.toHaveBeenCalledWith(true);
    const links = tabs(t(SETTINGS_PAGE_BY_ID.maintenance.labelKey));
    expect(links.map((link) => link.textContent)).toEqual(SETTINGS_TABS.maintenance.map((tab) => t(tab.labelKey)));
  });
});
