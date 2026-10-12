import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockSettings } from "@test/mocks/feature-hooks.mock";
import { createMockMutation } from "@test/mocks/trpc.mock";
import type { SoundcloudCardProps } from "../types";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useDownloadSources", () => ({
  useUpdateDownloadSources: () => update,
}));

import { SoundcloudCard } from "../SoundcloudCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: SoundcloudCardProps["initial"] = {
  slskd: { enabled: true, priority: 0 },
  ytdlp: { enabled: true, priority: 10, searchResults: 5, maxDurationDeltaSec: 15, searchTimeout: 60000 },
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
  archive: { enabled: false, priority: 20, collections: { netlabels: true, etree: false }, searchTimeout: 30000 },
  soundcloud: { enabled: false, priority: 12, searchResults: 15, maxDurationDeltaSec: 10, searchTimeout: 60000 },
  subsonic: { enabled: false, priority: 2, url: "", username: "", password: "", apiKey: "", searchTimeout: 30000 },
  torrent: createMockSettings().downloadSources.torrent,
};

const t = enSettings.soundcloud;

function save() {
  return userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));
}

describe("SoundcloudCard", () => {
  it("shows its own settings, labelled as SoundCloud's", () => {
    render(<SoundcloudCard initial={initial} />);

    expect(screen.getByText(t.title)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: t.enable.ariaLabel })).not.toBeChecked();
    expect(screen.getByLabelText(t.searchResults.ariaLabel)).toHaveValue(15);
    expect(screen.getByLabelText(t.maxDurationDelta.ariaLabel)).toHaveValue(10);
    expect(screen.getByLabelText(t.searchTimeout.ariaLabel)).toHaveValue(60);
  });

  it("saves the switch alongside every unchanged sibling source", async () => {
    render(<SoundcloudCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.enable.ariaLabel }));
    await save();

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        ...initial,
        soundcloud: { ...initial.soundcloud, enabled: true },
      });
    });
  });

  it("saves its search tuning, with the timeout in milliseconds", async () => {
    render(<SoundcloudCard initial={initial} />);

    fireEvent.change(screen.getByLabelText(t.searchResults.ariaLabel), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText(t.maxDurationDelta.ariaLabel), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(t.searchTimeout.ariaLabel), { target: { value: "45" } });
    await save();

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        ...initial,
        soundcloud: { ...initial.soundcloud, searchResults: 8, maxDurationDeltaSec: 4, searchTimeout: 45000 },
      });
    });
  });
});
