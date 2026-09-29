import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";
import { formatDateTime } from "@utils/formatters";

import { SystemStatusSection } from "../SystemStatusSection";
import type { SystemProblem, SystemProblemCopyParams } from "../types";

const auth = vi.hoisted(() => ({ isAdmin: true }));

const useSystemStatus = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api/queries/useSystemStatus", () => ({
  useSystemStatus: (enabled: boolean) => useSystemStatus(enabled),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: auth.isAdmin, currentUser: null, isLoading: false }),
}));

const CHECKED_AT = new Date(2026, 8, 29, 14, 32);

const EVERY_KIND: SystemProblem[] = [
  { kind: "downloads_unwritable", path: "/data/downloads", puid: "", pgid: "" },
  { kind: "library_inaccessible", path: "/data/music", puid: "99", pgid: "100" },
  { kind: "library_read_only", path: "/data/music-ro", puid: "1001", pgid: "" },
  { kind: "catalog_unreachable" },
  { kind: "config_value_ignored", name: "ADMIN_MIGRATION_PASSWORD" },
];

function renderWith(result: { data?: { checkedAt: Date | null; problems: SystemProblem[] }; isError?: boolean }) {
  useSystemStatus.mockReturnValue({ data: result.data, isError: result.isError ?? false });
  return render(<SystemStatusSection />);
}

function copyOf(kind: SystemProblem["kind"], part: "title" | "effect" | "fix", params: SystemProblemCopyParams = {}) {
  return i18n.t(`settings:maintenance.systemStatus.problems.${kind}.${part}`, params);
}

afterEach(() => {
  cleanup();
  useSystemStatus.mockReset();
  auth.isAdmin = true;
});

describe("SystemStatusSection", () => {
  it("fetches the status only for an admin", () => {
    auth.isAdmin = false;
    renderWith({});

    expect(useSystemStatus).toHaveBeenCalledWith(false);
    expect(useSystemStatus).not.toHaveBeenCalledWith(true);
  });

  it("renders one row per problem with its title, effect and fix", () => {
    renderWith({ data: { checkedAt: CHECKED_AT, problems: EVERY_KIND } });

    expect(screen.getAllByRole("listitem")).toHaveLength(EVERY_KIND.length);
    for (const problem of EVERY_KIND) {
      expect(screen.getByRole("heading", { name: copyOf(problem.kind, "title") })).toBeInTheDocument();
    }
  });

  it("fills the folder, and the container default 1000 for an unknown owner, into a downloads problem", () => {
    renderWith({ data: { checkedAt: CHECKED_AT, problems: EVERY_KIND } });

    expect(screen.getByText(copyOf("downloads_unwritable", "effect", { path: "/data/downloads" }))).toBeInTheDocument();
    expect(screen.getByText(copyOf("downloads_unwritable", "fix", { puid: "1000", pgid: "1000" }))).toBeInTheDocument();
  });

  it("keeps a known owner in the fix command rather than the default", () => {
    renderWith({ data: { checkedAt: CHECKED_AT, problems: EVERY_KIND } });

    expect(screen.getByText(copyOf("library_inaccessible", "effect", { path: "/data/music" }))).toBeInTheDocument();
    expect(screen.getByText(copyOf("library_inaccessible", "fix", { puid: "99", pgid: "100" }))).toBeInTheDocument();
  });

  it("defaults only the owner part that is unknown", () => {
    renderWith({ data: { checkedAt: CHECKED_AT, problems: EVERY_KIND } });

    expect(screen.getByText(copyOf("library_read_only", "effect", { path: "/data/music-ro" }))).toBeInTheDocument();
    expect(screen.getByText(copyOf("library_read_only", "fix", { puid: "1001", pgid: "1000" }))).toBeInTheDocument();
  });

  it("explains an unreachable catalog without any placeholders", () => {
    renderWith({ data: { checkedAt: CHECKED_AT, problems: EVERY_KIND } });

    expect(screen.getByText(copyOf("catalog_unreachable", "effect"))).toBeInTheDocument();
    expect(screen.getByText(copyOf("catalog_unreachable", "fix"))).toBeInTheDocument();
  });

  it("names the ignored setting", () => {
    renderWith({ data: { checkedAt: CHECKED_AT, problems: EVERY_KIND } });

    expect(
      screen.getByText(copyOf("config_value_ignored", "effect", { name: "ADMIN_MIGRATION_PASSWORD" }))
    ).toBeInTheDocument();
    expect(screen.getByText(copyOf("config_value_ignored", "fix"))).toBeInTheDocument();
  });

  it("leaves no placeholder unfilled in any row", () => {
    renderWith({ data: { checkedAt: CHECKED_AT, problems: EVERY_KIND } });

    for (const item of screen.getAllByRole("listitem")) {
      expect(item.textContent).not.toContain("{{");
    }
  });

  it("says everything is working, and when it was last checked, when there are no problems", () => {
    renderWith({ data: { checkedAt: CHECKED_AT, problems: [] } });

    expect(screen.getByText(i18n.t("settings:maintenance.systemStatus.allClear"))).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t("settings:maintenance.systemStatus.lastChecked", { time: formatDateTime(CHECKED_AT) }))
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows a loading state until the first answer arrives", () => {
    renderWith({});

    expect(screen.getByText(i18n.t("components:loading.section"))).toBeInTheDocument();
    expect(screen.queryByText(i18n.t("settings:maintenance.systemStatus.allClear"))).not.toBeInTheDocument();
  });

  it("says the status could not be loaded, rather than claiming all is well, when the query fails", () => {
    renderWith({ isError: true });

    expect(screen.getByRole("alert")).toHaveTextContent(i18n.t("settings:maintenance.systemStatus.loadError"));
    expect(screen.queryByText(i18n.t("settings:maintenance.systemStatus.allClear"))).not.toBeInTheDocument();
  });
});
