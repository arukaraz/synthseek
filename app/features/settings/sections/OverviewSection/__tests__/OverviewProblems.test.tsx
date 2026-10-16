import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import type { SystemProblem } from "../../../types";

interface State {
  push: Mock;
  router: { push: Mock };
  problems: SystemProblem[] | undefined;
  enabled: Mock;
}

const state = vi.hoisted((): State => {
  const push = vi.fn();
  return { push, router: { push }, problems: undefined, enabled: vi.fn() };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/overview",
  useRouter: () => state.router,
}));

vi.mock("@hooks/api/queries/useSystemStatus", () => ({
  useSystemStatus: (enabled: boolean) => {
    state.enabled(enabled);
    return { data: state.problems === undefined ? undefined : { checkedAt: null, problems: state.problems } };
  },
}));

import { SYSTEM_STATUS_HREF } from "../constants";
import { OverviewProblems } from "../components/OverviewProblems";

const t = i18n.getFixedT("en", "settings");

beforeEach(() => {
  state.push.mockReset();
  state.enabled.mockReset();
  state.problems = undefined;
});

describe("OverviewProblems", () => {
  it("renders nothing while the status is loading", () => {
    const { container } = render(<OverviewProblems />);
    expect(container).toBeEmptyDOMElement();
    expect(state.enabled).toHaveBeenCalledWith(true);
  });

  it("renders nothing when there is no problem", () => {
    state.problems = [];
    const { container } = render(<OverviewProblems />);
    expect(container).toBeEmptyDOMElement();
  });

  it("raises one alert per problem, titled by its kind", () => {
    state.problems = [
      { kind: "catalog_unreachable" },
      { kind: "downloads_unwritable", path: "/downloads", puid: "1000", pgid: "1000" },
    ];
    render(<OverviewProblems />);
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent(t("maintenance.systemStatus.problems.catalog_unreachable.title"));
    expect(alerts[1]).toHaveTextContent(t("maintenance.systemStatus.problems.downloads_unwritable.title"));
    for (const alert of alerts) expect(alert).toHaveTextContent(t("overview.problems.body"));
  });

  it("sends each fix to the system status page", async () => {
    state.problems = [{ kind: "catalog_unreachable" }, { kind: "config_value_ignored", name: "ADMIN_MIGRATION_EMAIL" }];
    render(<OverviewProblems />);
    const second = screen.getAllByRole("alert")[1];
    await userEvent.click(within(second).getByRole("button", { name: t("overview.problems.seeFix") }));
    expect(state.push).toHaveBeenCalledWith(SYSTEM_STATUS_HREF);
    expect(SYSTEM_STATUS_HREF).toBe("/settings/maintenance/status");
  });
});
