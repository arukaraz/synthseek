import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import type { YtdlpCardProps } from "../types";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useDownloadSources", () => ({
  useUpdateDownloadSources: () => update,
}));

import { YtdlpCard } from "../YtdlpCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: YtdlpCardProps["initial"] = {
  slskd: { enabled: true, priority: 0 },
  ytdlp: {
    enabled: false,
    priority: 10,
    searchResults: 5,
    maxDurationDeltaSec: 10,
    searchTimeout: 30000,
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

describe("YtdlpCard", () => {
  it("renders the card title", () => {
    render(<YtdlpCard initial={initial} />);
    expect(screen.getByText(enSettings.ytdlp.title)).toBeInTheDocument();
  });

  it("reflects the initial enabled state on the toggle", () => {
    render(<YtdlpCard initial={initial} />);
    expect(screen.getByRole("switch", { name: enSettings.ytdlp.enable.ariaLabel })).not.toBeChecked();
  });

  it("saves the ytdlp draft alongside every unchanged sibling source after an edit", async () => {
    render(<YtdlpCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.ytdlp.enable.ariaLabel }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        slskd: initial.slskd,
        ytdlp: { ...initial.ytdlp, enabled: true },
        usenet: initial.usenet,
      });
    });
  });

  it("reverts the draft when cancel is pressed", async () => {
    render(<YtdlpCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.ytdlp.enable.ariaLabel }));
    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.save })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });
});
