import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

let pathname = "/settings/account";
let isAdmin = true;
let problems: string[] = [];
let maintenanceCounts = { review: 2, duplicates: 5, recycleBin: 78, quarantine: 12 };
const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@hooks/api/queries/useMaintenanceCounts", () => ({
  useMaintenanceCounts: () => ({ data: maintenanceCounts }),
}));

vi.mock("@hooks/api/queries/useSystemStatus", () => ({
  useSystemStatus: () => ({ data: { problems } }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin, currentUser: null, isLoading: false }),
}));

import { SettingsSidebar } from "../SettingsSidebar";

const pages = enSettings.shell.pages;
const groups = enSettings.shell.sidebar.groups;

function renderSidebar(query = "", onQueryChange = vi.fn()) {
  const view = render(<SettingsSidebar query={query} onQueryChange={onQueryChange} />);
  return { ...view, onQueryChange };
}

function linkFor(label: string) {
  return screen.getByText(label).closest("a");
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  pathname = "/settings/account";
  isAdmin = true;
  problems = [];
  maintenanceCounts = { review: 2, duplicates: 5, recycleBin: 78, quarantine: 12 };
});

describe("SettingsSidebar", () => {
  it("renders the navigation landmark, the search box and the build version footer", () => {
    renderSidebar();

    expect(screen.getByRole("navigation", { name: enSettings.shell.sidebar.ariaLabel })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: enSettings.shell.search.label })).toBeInTheDocument();
    expect(screen.getByText(/synthseek v/i)).toBeInTheDocument();
  });

  it("lists the personal pages under the You group with their routes", () => {
    renderSidebar();

    expect(screen.getByText(groups.you)).toBeInTheDocument();
    expect(linkFor(pages.account.title)).toHaveAttribute("href", "/settings/account");
    expect(linkFor(pages.appearance.title)).toHaveAttribute("href", "/settings/appearance");
    expect(linkFor(pages.connectedAccounts.title)).toHaveAttribute("href", "/settings/connected-accounts");
    expect(linkFor(pages.listening.title)).toHaveAttribute("href", "/settings/listening");
    expect(linkFor(pages.notifications.title)).toHaveAttribute("href", "/settings/notifications");
    expect(linkFor(pages.apps.title)).toHaveAttribute("href", "/settings/apps");
  });

  it("shows the This server group to an administrator", () => {
    renderSidebar();

    expect(screen.getByText(groups.server)).toBeInTheDocument();
    expect(linkFor(pages.overview.title)).toHaveAttribute("href", "/settings/overview");
    expect(linkFor(pages.members.title)).toHaveAttribute("href", "/settings/members");
    expect(linkFor(pages.downloadSources.title)).toHaveAttribute("href", "/settings/download-sources");
    expect(linkFor(pages.engine.title)).toHaveAttribute("href", "/settings/engine");
    expect(linkFor(pages.library.title)).toHaveAttribute("href", "/settings/library");
    expect(linkFor(pages.media.title)).toHaveAttribute("href", "/settings/media");
    expect(linkFor(pages.metadata.title)).toHaveAttribute("href", "/settings/metadata");
    expect(linkFor(pages.maintenance.title)).toHaveAttribute("href", "/settings/maintenance");
    expect(linkFor(pages.system.title)).toHaveAttribute("href", "/settings/system");
  });

  it("hides the This server group from a non-admin user but keeps the personal pages", () => {
    isAdmin = false;
    renderSidebar();

    expect(screen.queryByText(groups.server)).not.toBeInTheDocument();
    expect(screen.queryByText(pages.overview.title)).not.toBeInTheDocument();
    expect(screen.queryByText(pages.members.title)).not.toBeInTheDocument();
    expect(screen.queryByText(pages.downloadSources.title)).not.toBeInTheDocument();
    expect(screen.getByText(groups.you)).toBeInTheDocument();
    expect(linkFor(pages.notifications.title)).toHaveAttribute("href", "/settings/notifications");
  });

  it("offers About & updates at the bottom to every user", () => {
    isAdmin = false;
    renderSidebar();

    expect(linkFor(pages.about.title)).toHaveAttribute("href", "/settings/about");
  });

  it("marks the link whose route contains the current path as the current page", () => {
    pathname = "/settings/library/scan";
    renderSidebar();

    expect(linkFor(pages.library.title)).toHaveAttribute("aria-current", "page");
    expect(linkFor(pages.account.title)).not.toHaveAttribute("aria-current");
  });

  it("flags the overview when the system reports problems and maintenance when something waits", () => {
    problems = ["slskd unreachable"];
    renderSidebar();

    const attention = enSettings.shell.sidebar.attention;
    const overview = linkFor(pages.overview.title);
    const maintenance = linkFor(pages.maintenance.title);
    expect(overview).not.toBeNull();
    expect(maintenance).not.toBeNull();
    if (!overview || !maintenance) return;
    expect(within(overview).getByText(attention)).toBeInTheDocument();
    expect(within(maintenance).getByText(attention)).toBeInTheDocument();
  });

  it("leaves the overview and maintenance unflagged when nothing needs attention", () => {
    maintenanceCounts = { review: 0, duplicates: 0, recycleBin: 0, quarantine: 0 };
    renderSidebar();

    expect(screen.queryByText(enSettings.shell.sidebar.attention)).not.toBeInTheDocument();
  });

  it("reports each keystroke in the search box to its owner", async () => {
    const { onQueryChange } = renderSidebar();

    await userEvent.type(screen.getByRole("textbox", { name: enSettings.shell.search.label }), "t");

    expect(onQueryChange).toHaveBeenCalledWith("t");
  });

  it("replaces the grouped links with matching results while a query is set", () => {
    renderSidebar("telegram");

    expect(screen.queryByText(groups.you)).not.toBeInTheDocument();
    expect(screen.queryByText(pages.account.title)).not.toBeInTheDocument();
    expect(screen.getByText(i18n.t("settings:shell.search.summary", { count: 2, places: 1 }))).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /telegram/i }).length).toBeGreaterThan(0);
  });

  it("navigates to the first result and clears the query when Enter is pressed", async () => {
    const { onQueryChange } = renderSidebar("telegram");

    screen.getByRole("textbox", { name: enSettings.shell.search.label }).focus();
    await userEvent.keyboard("{Enter}");

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/settings/notifications#telegram");
    expect(onQueryChange).toHaveBeenCalledWith("");
  });

  it("navigates to a result when it is picked", async () => {
    renderSidebar("telegram");

    const destinations = screen.getByText(enSettings.notifications.destinations.title).closest("button");
    expect(destinations).not.toBeNull();
    if (!destinations) return;
    await userEvent.click(destinations);

    expect(push).toHaveBeenCalledWith("/settings/notifications#destinations");
  });

  it("keeps server settings out of a non-admin user's results", async () => {
    isAdmin = false;
    const { onQueryChange } = renderSidebar("slskd");

    expect(screen.getByText(enSettings.shell.search.empty)).toBeInTheDocument();

    screen.getByRole("textbox", { name: enSettings.shell.search.label }).focus();
    await userEvent.keyboard("{Enter}");

    expect(push).not.toHaveBeenCalled();
    expect(onQueryChange).not.toHaveBeenCalled();
  });

  it("finds server settings for an administrator", () => {
    renderSidebar("slskd");

    expect(screen.queryByText(enSettings.shell.search.empty)).not.toBeInTheDocument();
  });
});
