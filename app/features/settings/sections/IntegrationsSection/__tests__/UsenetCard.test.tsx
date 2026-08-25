import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import type { UsenetCardProps } from "../types";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useDownloadSources", () => ({
  useUpdateDownloadSources: () => update,
}));

vi.mock("../StagedReleaseList", () => ({
  StagedReleaseList: ({ enabled }: { enabled: boolean }) => (
    <div data-testid="staged-release-list" data-enabled={String(enabled)} />
  ),
}));

import { UsenetCard } from "../UsenetCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: UsenetCardProps["initial"] = {
  slskd: { enabled: true, priority: 0 },
  ytdlp: {
    enabled: true,
    priority: 10,
    searchResults: 15,
    maxDurationDeltaSec: 15,
    searchTimeout: 60000,
  },
  usenet: {
    enabled: false,
    priority: 5,
    indexerUrl: "",
    indexerApiKey: "",
    sabnzbdUrl: "",
    sabnzbdApiKey: "",
    maxSizeMb: 1000,
    minAgeHours: 1,
    searchTimeout: 30000,
    singleTrackRequests: false,
    stagingRetentionHours: 24,
  },
};

const optedIn: UsenetCardProps["initial"] = {
  ...initial,
  usenet: { ...initial.usenet, singleTrackRequests: true },
};

const t = enSettings.usenet;

describe("UsenetCard", () => {
  it("renders the card title", () => {
    render(<UsenetCard initial={initial} />);
    expect(screen.getByText(t.title)).toBeInTheDocument();
  });

  it("reflects the initial disabled state on the enable toggle", () => {
    render(<UsenetCard initial={initial} />);
    expect(screen.getByRole("switch", { name: t.enable.ariaLabel })).not.toBeChecked();
  });

  it("renders the single-track section header and its info tooltip trigger", () => {
    render(<UsenetCard initial={initial} />);
    expect(screen.getByText(t.singleTrackRequests.title)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t.singleTrackRequests.tooltipTriggerLabel })).toBeInTheDocument();
  });

  it("hides the retention control while single-track requests are off", () => {
    render(<UsenetCard initial={initial} />);
    expect(screen.queryByLabelText(t.stagingRetention.ariaLabel)).not.toBeInTheDocument();
  });

  it("reveals the retention control when single-track requests are already on", () => {
    render(<UsenetCard initial={optedIn} />);
    expect(screen.getByLabelText(t.stagingRetention.ariaLabel)).toBeInTheDocument();
  });

  it("reveals the retention control as soon as the opt-in is switched on", async () => {
    render(<UsenetCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.singleTrackRequests.ariaLabel }));

    expect(screen.getByLabelText(t.stagingRetention.ariaLabel)).toBeInTheDocument();
  });

  it("hides the retention control again when the opt-in is switched back off", async () => {
    render(<UsenetCard initial={optedIn} />);

    await userEvent.click(screen.getByRole("switch", { name: t.singleTrackRequests.ariaLabel }));

    expect(screen.queryByLabelText(t.stagingRetention.ariaLabel)).not.toBeInTheDocument();
  });

  it("saves the usenet draft alongside every unchanged sibling source", async () => {
    render(<UsenetCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.enable.ariaLabel }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        slskd: initial.slskd,
        ytdlp: initial.ytdlp,
        usenet: { ...initial.usenet, enabled: true },
      });
    });
  });

  it("carries the opt-in flag into the saved payload", async () => {
    render(<UsenetCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.singleTrackRequests.ariaLabel }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        slskd: initial.slskd,
        ytdlp: initial.ytdlp,
        usenet: { ...initial.usenet, singleTrackRequests: true },
      });
    });
  });

  it("shows the waiting-albums list only once single-track requests are on", async () => {
    render(<UsenetCard initial={initial} />);
    expect(screen.queryByTestId("staged-release-list")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("switch", { name: t.singleTrackRequests.ariaLabel }));

    expect(screen.getByTestId("staged-release-list")).toBeInTheDocument();
  });

  it("tells the list whether the source is enabled, so it does not query while off", () => {
    render(<UsenetCard initial={optedIn} />);

    expect(screen.getByTestId("staged-release-list")).toHaveAttribute("data-enabled", "false");
  });

  it("reverts the draft when cancel is pressed", async () => {
    render(<UsenetCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.enable.ariaLabel }));
    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.save })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });
});
