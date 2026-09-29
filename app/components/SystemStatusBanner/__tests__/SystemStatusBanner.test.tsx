import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

import i18n from "@modules/i18n";
import type { SystemProblem } from "@features/settings/sections/MaintenanceSection/types";

import { SystemStatusBanner } from "../SystemStatusBanner";

const state = vi.hoisted((): { isAdmin: boolean; problems: SystemProblem[]; pathname: string } => ({
  isAdmin: true,
  problems: [],
  pathname: "/settings/general",
}));

const useSystemStatus = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api/queries/useSystemStatus", () => ({
  useSystemStatus: (enabled: boolean) => useSystemStatus(enabled),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: state.isAdmin, currentUser: null, isLoading: false }),
}));

vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const DOWNLOADS: SystemProblem = { kind: "downloads_unwritable", path: "/downloads", puid: "", pgid: "" };
const CATALOG: SystemProblem = { kind: "catalog_unreachable" };
const IGNORED: SystemProblem = { kind: "config_value_ignored", name: "ADMIN_MIGRATION_EMAIL" };

function renderBanner({ isAdmin, problems }: { isAdmin: boolean; problems: SystemProblem[] }) {
  state.isAdmin = isAdmin;
  state.problems = problems;
  useSystemStatus.mockReturnValue({ data: { checkedAt: new Date(), problems: state.problems } });
  return render(<SystemStatusBanner />);
}

afterEach(() => {
  cleanup();
  useSystemStatus.mockReset();
});

describe("SystemStatusBanner", () => {
  it("never asks for the system status on a member's behalf", () => {
    renderBanner({ isAdmin: false, problems: [DOWNLOADS] });

    expect(useSystemStatus).toHaveBeenCalledWith(false);
    expect(useSystemStatus).not.toHaveBeenCalledWith(true);
  });

  it("renders nothing for a member, even with problems left in the cache by an admin session", () => {
    const { container } = renderBanner({ isAdmin: false, problems: [DOWNLOADS] });

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for an admin while nothing is wrong", () => {
    const { container } = renderBanner({ isAdmin: true, problems: [] });

    expect(useSystemStatus).toHaveBeenCalledWith(true);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for an admin before the first answer arrives", () => {
    state.isAdmin = true;
    useSystemStatus.mockReturnValue({ data: undefined });

    const { container } = render(<SystemStatusBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it("names the first problem and counts the rest when there are several", () => {
    renderBanner({ isAdmin: true, problems: [DOWNLOADS, CATALOG, IGNORED] });

    const region = screen.getByRole("region", { name: i18n.t("appShell:systemStatusBanner.label") });

    expect(
      within(region).getByText(i18n.t("settings:maintenance.systemStatus.problems.downloads_unwritable.title"))
    ).toBeInTheDocument();
    expect(within(region).getByText(i18n.t("appShell:systemStatusBanner.more", { count: 2 }))).toBeInTheDocument();
    expect(region).not.toHaveTextContent(
      i18n.t("settings:maintenance.systemStatus.problems.catalog_unreachable.title")
    );
  });

  it("uses the singular for exactly one more problem", () => {
    renderBanner({ isAdmin: true, problems: [CATALOG, IGNORED] });

    const region = screen.getByRole("region", { name: i18n.t("appShell:systemStatusBanner.label") });

    expect(within(region).getByText(i18n.t("appShell:systemStatusBanner.more", { count: 1 }))).toBeInTheDocument();
  });

  it("says nothing about more problems when there is only one", () => {
    renderBanner({ isAdmin: true, problems: [CATALOG] });

    const region = screen.getByRole("region", { name: i18n.t("appShell:systemStatusBanner.label") });

    expect(region).toHaveTextContent(i18n.t("settings:maintenance.systemStatus.problems.catalog_unreachable.title"));
    expect(region).not.toHaveTextContent(i18n.t("appShell:systemStatusBanner.more", { count: 0 }));
  });

  it("links to the system status page", () => {
    renderBanner({ isAdmin: true, problems: [DOWNLOADS, CATALOG] });

    expect(screen.getByRole("link", { name: i18n.t("appShell:systemStatusBanner.details") })).toHaveAttribute(
      "href",
      "/settings/maintenance/status"
    );
  });

  it("renders nothing and asks nothing outside Settings", () => {
    state.pathname = "/library";

    const { container } = renderBanner({ isAdmin: true, problems: [DOWNLOADS] });
    state.pathname = "/settings/general";

    expect(useSystemStatus).toHaveBeenCalledWith(false);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not mistake a path that only starts with the same letters for Settings", () => {
    state.pathname = "/settingsx";

    const { container } = renderBanner({ isAdmin: true, problems: [DOWNLOADS] });
    state.pathname = "/settings/general";

    expect(container).toBeEmptyDOMElement();
  });

  it.each(["/settings", "/settings/maintenance/status", "/settings/integrations"])("shows on %s", (path) => {
    state.pathname = path;

    renderBanner({ isAdmin: true, problems: [DOWNLOADS] });
    state.pathname = "/settings/general";

    expect(screen.getByRole("region", { name: i18n.t("appShell:systemStatusBanner.label") })).toBeInTheDocument();
  });
});
