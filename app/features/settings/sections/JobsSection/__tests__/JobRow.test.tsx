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

vi.mock("@hooks/api/mutations/jobs/useTriggerJob", () => ({
  useTriggerJob: () => trigger,
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
});
