import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockSettings } from "@test/mocks/feature-hooks.mock";
import { createMockMutation } from "@test/mocks/trpc.mock";
import type { ArchiveCardProps } from "../types";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/settings/useDownloadSources", () => ({
  useUpdateDownloadSources: () => update,
}));

import { ArchiveCard } from "../ArchiveCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const initial: ArchiveCardProps["initial"] = {
  slskd: { enabled: true, priority: 0 },
  ytdlp: { enabled: true, priority: 10, searchResults: 5, maxDurationDeltaSec: 10, searchTimeout: 30000 },
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
    collections: { netlabels: true, etree: false, community: false },
    searchTimeout: 30000,
  },
  soundcloud: { enabled: true, priority: 12, searchResults: 15, maxDurationDeltaSec: 10, searchTimeout: 60000 },
  subsonic: { enabled: false, priority: 2, url: "", username: "", password: "", apiKey: "", searchTimeout: 30000 },
  torrent: createMockSettings().downloadSources.torrent,
};

const { priority: _priority, ...storedArchive } = initial.archive;

const t = enSettings.archive;

function save() {
  return userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));
}

describe("ArchiveCard", () => {
  it("shows the stored switches", () => {
    render(<ArchiveCard initial={initial} />);

    expect(screen.getByText(t.title)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: t.enable.ariaLabel })).toBeChecked();
    expect(screen.getByRole("switch", { name: t.netlabels.ariaLabel })).toBeChecked();
    expect(screen.getByRole("switch", { name: t.etree.ariaLabel })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: t.community.ariaLabel })).not.toBeChecked();
  });

  it("saves community uploads turned on without touching the other collections", async () => {
    render(<ArchiveCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.community.ariaLabel }));
    await save();

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        archive: { ...storedArchive, collections: { netlabels: true, etree: false, community: true } },
      });
    });
  });

  it("saves only the archive source, leaving its priority and every sibling source out of the payload", async () => {
    render(<ArchiveCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.etree.ariaLabel }));
    await save();

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        archive: { ...storedArchive, collections: { netlabels: true, etree: true, community: false } },
      });
    });
  });

  it("stores the search timeout in milliseconds", async () => {
    render(<ArchiveCard initial={initial} />);

    const timeout = screen.getByLabelText(t.searchTimeout.ariaLabel);
    expect(timeout).toHaveValue(30);
    fireEvent.change(timeout, { target: { value: "45" } });
    await save();

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({ archive: { ...storedArchive, searchTimeout: 45000 } });
    });
  });

  it("warns that the source stays idle once every collection is off", async () => {
    render(<ArchiveCard initial={initial} />);
    expect(screen.queryByText(t.noCollection)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("switch", { name: t.netlabels.ariaLabel }));

    expect(screen.getByText(t.noCollection)).toBeInTheDocument();
  });

  it("counts community uploads as a collection that keeps the source working", async () => {
    render(<ArchiveCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.community.ariaLabel }));
    await userEvent.click(screen.getByRole("switch", { name: t.netlabels.ariaLabel }));

    expect(screen.queryByText(t.noCollection)).not.toBeInTheDocument();
  });

  it("does not warn about collections while the source is off", () => {
    const off = {
      ...initial,
      archive: {
        ...initial.archive,
        enabled: false,
        collections: { netlabels: false, etree: false, community: false },
      },
    };

    render(<ArchiveCard initial={off} />);

    expect(screen.queryByText(t.noCollection)).not.toBeInTheDocument();
  });
});
