import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockSettings } from "@test/mocks/feature-hooks.mock";
import { createMockMutation } from "@test/mocks/trpc.mock";
import { SECRET_SENTINEL } from "../../../components/constants";
import type { UsenetCardProps } from "../types";

const update = createMockMutation();

const reveal = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api/mutations/settings/useDownloadSources", () => ({
  useUpdateDownloadSources: () => update,
}));

vi.mock("@hooks/api/mutations/settings/useRevealSecret", () => ({ useRevealSettingsSecret: () => reveal }));

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
  archive: {
    enabled: true,
    priority: 20,
    collections: { netlabels: true, etree: true, community: false },
    searchTimeout: 30000,
  },
  soundcloud: { enabled: false, priority: 12, searchResults: 15, maxDurationDeltaSec: 10, searchTimeout: 60000 },
  subsonic: { enabled: false, priority: 2, url: "", username: "", password: "", apiKey: "", searchTimeout: 30000 },
  torrent: createMockSettings().downloadSources.torrent,
};

const optedIn: UsenetCardProps["initial"] = {
  ...initial,
  usenet: { ...initial.usenet, singleTrackRequests: true },
};

const t = enSettings.usenet;

describe("UsenetCard", () => {
  it("asks for each saved key by its own field when its eye is clicked", async () => {
    reveal.mockResolvedValue("real");
    const usenet = { ...initial.usenet, indexerApiKey: SECRET_SENTINEL, sabnzbdApiKey: SECRET_SENTINEL };
    render(<UsenetCard initial={{ ...initial, usenet }} />);

    for (const eye of screen.getAllByLabelText(enSettings.shell.secretInput.reveal)) await userEvent.click(eye);

    expect(reveal.mock.calls.map(([ref]) => ref)).toEqual([
      { section: "downloadSources.usenet", field: "indexerApiKey" },
      { section: "downloadSources.usenet", field: "sabnzbdApiKey" },
    ]);
  });

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
        archive: initial.archive,
        soundcloud: initial.soundcloud,
        subsonic: initial.subsonic,
        torrent: initial.torrent,
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
        archive: initial.archive,
        soundcloud: initial.soundcloud,
        subsonic: initial.subsonic,
        torrent: initial.torrent,
      });
    });
  });

  it("points to the downloaded albums under Maintenance only once single-track requests are on", async () => {
    render(<UsenetCard initial={initial} />);
    expect(screen.queryByRole("link", { name: enSettings.downloadedAlbumsPointer.link })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("switch", { name: t.singleTrackRequests.ariaLabel }));

    expect(screen.getByRole("link", { name: enSettings.downloadedAlbumsPointer.link })).toHaveAttribute(
      "href",
      "/settings/maintenance/downloaded-albums"
    );
  });

  it("reverts the draft when cancel is pressed", async () => {
    render(<UsenetCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.enable.ariaLabel }));
    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.save })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });
});
