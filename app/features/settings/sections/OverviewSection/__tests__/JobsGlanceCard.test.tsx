import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import { createMockJob } from "@test/mocks/feature-hooks.mock";

type Job = ReturnType<typeof createMockJob>;

interface State {
  push: Mock;
  router: { push: Mock };
  jobs: Job[] | undefined;
}

const state = vi.hoisted((): State => {
  const push = vi.fn();
  return { push, router: { push }, jobs: undefined };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/overview",
  useRouter: () => state.router,
}));

vi.mock("@hooks/api/queries/useJobs", () => ({
  useJobs: () => ({ data: state.jobs }),
}));

vi.mock("../../../components/JobRow", () => ({
  JobRow: ({ job }: { job: Job }) => <div data-testid="job-row">{job.id}</div>,
}));

import { ALL_JOBS_HREF, OVERVIEW_JOB_LIMIT } from "../constants";
import { JobsGlanceCard } from "../components/JobsGlanceCard";

const t = i18n.getFixedT("en", "settings");

beforeEach(() => {
  state.push.mockReset();
  state.jobs = [
    createMockJob({ id: "library-sync", nextRun: new Date("2030-01-01T02:00:00Z") }),
    createMockJob({ id: "wanted-sweep", nextRun: new Date("2030-01-01T01:00:00Z") }),
    createMockJob({ id: "library-scan", lastStatus: "failed" }),
    createMockJob({ id: "discovery-sweep", running: true }),
    createMockJob({ id: "scrobble-relay", listed: false, running: true }),
  ];
});

describe("JobsGlanceCard", () => {
  it("shows a loading line until the jobs arrive", () => {
    state.jobs = undefined;
    render(<JobsGlanceCard />);
    expect(screen.getByText(t("jobs.card.loading"))).toBeInTheDocument();
    expect(screen.queryByTestId("job-row")).not.toBeInTheDocument();
  });

  it("shows the most pressing jobs, up to the limit", () => {
    render(<JobsGlanceCard />);
    const rows = screen.getAllByTestId("job-row").map((row) => row.textContent);
    expect(rows).toHaveLength(OVERVIEW_JOB_LIMIT);
    expect(rows).toEqual(["discovery-sweep", "library-scan", "wanted-sweep"]);
  });

  it("opens the full job list", async () => {
    render(<JobsGlanceCard />);
    expect(screen.getByRole("heading", { name: t("jobs.card.title") })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: t("overview.jobs.all") }));
    expect(state.push).toHaveBeenCalledWith(ALL_JOBS_HREF);
    expect(ALL_JOBS_HREF).toBe("/settings/system/jobs");
  });
});
