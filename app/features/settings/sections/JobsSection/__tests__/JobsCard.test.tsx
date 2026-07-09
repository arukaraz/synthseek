import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

import type { JobSummary } from "../types";

let jobsQuery: MockQueryResult<JobSummary[] | undefined> = createMockQuery<JobSummary[] | undefined>(undefined);

vi.mock("@hooks/api/queries/useJobs", () => ({
  useJobs: () => jobsQuery,
}));

vi.mock("../JobRow", () => ({
  JobRow: ({ job }: { job: JobSummary }) => <div data-testid="job-row" data-job-id={job.id} />,
}));

import { JobsCard } from "../JobsCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  jobsQuery = createMockQuery<JobSummary[] | undefined>(undefined);
});

const makeJob = (id: JobSummary["id"], overrides: Partial<JobSummary> = {}): JobSummary => ({
  id,
  name: id,
  description: "",
  intervalMs: 60_000,
  enabled: true,
  nextRun: null,
  lastRun: null,
  lastStatus: null,
  ...overrides,
});

describe("JobsCard", () => {
  it("renders the card title and description", () => {
    jobsQuery = createMockQuery<JobSummary[] | undefined>([]);
    render(<JobsCard />);
    expect(screen.getByText(enSettings.jobs.card.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.jobs.card.description)).toBeInTheDocument();
  });

  it("renders the loading state", () => {
    jobsQuery = createLoadingQuery<JobSummary[] | undefined>();
    render(<JobsCard />);
    expect(screen.getByText(enSettings.jobs.card.loading)).toBeInTheDocument();
  });

  it("renders the error state with the error message", () => {
    jobsQuery = createErrorQuery<JobSummary[] | undefined>(new Error("boom"));
    render(<JobsCard />);
    expect(screen.getByText(enSettings.jobs.card.loadError.replace("{{message}}", "boom"))).toBeInTheDocument();
  });

  it("renders one row per enabled job", () => {
    jobsQuery = createMockQuery<JobSummary[] | undefined>([
      makeJob("library-sync"),
      makeJob("discovery-sweep"),
      makeJob("media-server-sync"),
    ]);
    render(<JobsCard />);

    const rows = screen.getAllByTestId("job-row");
    expect(rows).toHaveLength(3);
    const ids = rows.map((row) => row.getAttribute("data-job-id"));
    expect(ids).toEqual(["library-sync", "discovery-sweep", "media-server-sync"]);
  });

  it("hides disabled jobs", () => {
    jobsQuery = createMockQuery<JobSummary[] | undefined>([
      makeJob("library-sync", { enabled: false }),
      makeJob("discovery-sweep"),
      makeJob("media-server-sync", { enabled: false }),
    ]);
    render(<JobsCard />);

    const rows = screen.getAllByTestId("job-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.getAttribute("data-job-id")).toBe("discovery-sweep");
  });
});
