import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enComponents from "@modules/i18n/messages/en/components.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import { HOUR_MS } from "../constants";
import type { JobRowProps } from "../types";

const trigger = createMockMutation();
const stop = createMockMutation();

vi.mock("@hooks/api/mutations/jobs/useTriggerJob", () => ({
  useTriggerJob: () => trigger,
}));

vi.mock("@hooks/api/mutations/jobs/useStopJob", () => ({
  useStopJob: () => stop,
}));

vi.mock("@hooks/ui/useNow", () => ({
  useNow: () => 1_000_000,
}));

import { JobRow } from "../JobRow";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "components", enComponents, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  trigger.isPending = false;
  stop.isPending = false;
});

const job: JobRowProps["job"] = {
  id: "library-sync",
  intervalMs: HOUR_MS,
  nextRun: new Date(1_000_000 + 5 * 60_000),
};

describe("JobRow", () => {
  it("renders the localized job name and description", () => {
    render(<JobRow job={job} />);
    expect(screen.getByText(enSettings.jobs.registry["library-sync"].name)).toBeInTheDocument();
    expect(screen.getByText(enSettings.jobs.registry["library-sync"].description)).toBeInTheDocument();
  });

  it("renders the localized name and description for the wanted-sweep job", () => {
    render(<JobRow job={{ ...job, id: "wanted-sweep" }} />);
    expect(screen.getByText(enSettings.jobs.registry["wanted-sweep"].name)).toBeInTheDocument();
    expect(screen.getByText(enSettings.jobs.registry["wanted-sweep"].description)).toBeInTheDocument();
  });

  it("tells the listener how much of the library the loudness job has covered", () => {
    render(<JobRow job={{ ...job, id: "library-loudness", progress: { done: 3402, total: 8410 } }} />);

    expect(screen.getByText("3,402 of 8,410 tracks done")).toBeInTheDocument();
  });

  it("says how many tracks it gave up on, so a counter short of the total explains itself", () => {
    render(<JobRow job={{ ...job, id: "library-loudness", progress: { done: 8353, total: 8410, skipped: 57 } }} />);

    expect(screen.getByText("8,353 of 8,410 tracks done")).toBeInTheDocument();
    expect(screen.getByText("· 57 skipped")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.jobs.row.skippedTooltipTriggerLabel })).toBeInTheDocument();
  });

  it("counts one skipped track in the singular, and formats a large count like the rest of the line", () => {
    render(<JobRow job={{ ...job, id: "library-loudness", progress: { done: 10, total: 11, skipped: 1 } }} />);
    expect(screen.getByText("· 1 skipped")).toBeInTheDocument();

    cleanup();
    render(<JobRow job={{ ...job, id: "library-loudness", progress: { done: 10, total: 2345, skipped: 2335 } }} />);
    expect(screen.getByText("· 2,335 skipped")).toBeInTheDocument();
  });

  it("stays quiet about skipped tracks when there are none, rather than showing a zero", () => {
    render(<JobRow job={{ ...job, id: "library-loudness", progress: { done: 8410, total: 8410, skipped: 0 } }} />);

    expect(screen.queryByText(/skipped/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: enSettings.jobs.row.skippedTooltipTriggerLabel })
    ).not.toBeInTheDocument();
  });

  it("says nothing about progress for a job that does not report any", () => {
    render(<JobRow job={job} />);

    expect(screen.queryByText(/tracks done/)).not.toBeInTheDocument();
  });

  it("renders the interval label and the formatted next run", () => {
    render(<JobRow job={job} />);
    expect(screen.getByText(enSettings.jobs.interval.everyHour)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("min")).toBeInTheDocument();
  });

  it("renders the idle fallback when there is no next run", () => {
    render(<JobRow job={{ ...job, nextRun: null }} />);
    expect(screen.getByText(enSettings.jobs.row.nextRunFallback)).toBeInTheDocument();
  });

  it("triggers the job by id when the play button is clicked", async () => {
    render(<JobRow job={job} />);
    const name = enSettings.jobs.registry["library-sync"].name;
    await userEvent.click(screen.getByRole("button", { name: `Run ${name} now` }));
    expect(trigger.mutate).toHaveBeenCalledWith({ id: "library-sync" });
  });

  it("shows the in-progress state and disables the button while running", () => {
    trigger.isPending = true;
    render(<JobRow job={job} />);
    expect(screen.getByText(enSettings.jobs.row.inProgress)).toBeInTheDocument();
    const name = enSettings.jobs.registry["library-sync"].name;
    const button = screen.getByRole("button", { name: `Running ${name}` });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("stays in progress from the server's running flag after the trigger request has settled", () => {
    trigger.isPending = false;
    render(<JobRow job={{ ...job, running: true }} />);
    expect(screen.getByText(enSettings.jobs.row.inProgress)).toBeInTheDocument();
    const name = enSettings.jobs.registry["library-sync"].name;
    expect(screen.getByRole("button", { name: `Running ${name}` })).toBeDisabled();
  });

  it("turns the run button into a stop button while a job that can be interrupted is running", async () => {
    render(<JobRow job={{ ...job, running: true, canStop: true }} />);
    const name = enSettings.jobs.registry["library-sync"].name;

    expect(screen.queryByRole("button", { name: `Running ${name}` })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: `Stop ${name}` }));

    expect(stop.mutate).toHaveBeenCalledWith({ id: "library-sync" });
    expect(trigger.mutate).not.toHaveBeenCalled();
  });

  it("does not call the stop button busy, since it is the job that is working and the control is ready", () => {
    render(<JobRow job={{ ...job, running: true, canStop: true }} />);
    const name = enSettings.jobs.registry["library-sync"].name;

    const button = screen.getByRole("button", { name: `Stop ${name}` });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy", "true");
  });

  it("keeps the disabled spinner for a running job that cannot be interrupted, rather than a stop that does nothing", () => {
    render(<JobRow job={{ ...job, running: true, canStop: false }} />);
    const name = enSettings.jobs.registry["library-sync"].name;

    expect(screen.queryByRole("button", { name: `Stop ${name}` })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Running ${name}` })).toBeDisabled();
  });

  it("offers no stop button while the job is idle", () => {
    render(<JobRow job={{ ...job, running: false, canStop: true }} />);
    const name = enSettings.jobs.registry["library-sync"].name;

    expect(screen.queryByRole("button", { name: `Stop ${name}` })).not.toBeInTheDocument();
  });

  it("surfaces a failed last run once the job is no longer running", () => {
    render(<JobRow job={{ ...job, running: false, lastStatus: "failed" }} />);
    expect(screen.getByText(enSettings.jobs.row.lastRunFailed)).toBeInTheDocument();
  });

  it("hides the failed marker while the job is running again", () => {
    render(<JobRow job={{ ...job, running: true, lastStatus: "failed" }} />);
    expect(screen.queryByText(enSettings.jobs.row.lastRunFailed)).not.toBeInTheDocument();
    expect(screen.getByText(enSettings.jobs.row.inProgress)).toBeInTheDocument();
  });
});
