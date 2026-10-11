import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

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
    collections: { netlabels: true, etree: false },
    searchTimeout: 30000,
  },
  soundcloud: { enabled: true, priority: 12, searchResults: 15, maxDurationDeltaSec: 10, searchTimeout: 60000 },
};

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
  });

  it("saves a collection change alongside every unchanged sibling source", async () => {
    render(<ArchiveCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: t.etree.ariaLabel }));
    await save();

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        slskd: initial.slskd,
        ytdlp: initial.ytdlp,
        usenet: initial.usenet,
        archive: { ...initial.archive, collections: { netlabels: true, etree: true } },
        soundcloud: initial.soundcloud,
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
      expect(update.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ archive: expect.objectContaining({ searchTimeout: 45000 }) })
      );
    });
  });

  it("warns that the source stays idle once every collection is off", async () => {
    render(<ArchiveCard initial={initial} />);
    expect(screen.queryByText(t.noCollection)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("switch", { name: t.netlabels.ariaLabel }));

    expect(screen.getByText(t.noCollection)).toBeInTheDocument();
  });

  it("does not warn about collections while the source is off", () => {
    const off = {
      ...initial,
      archive: { ...initial.archive, enabled: false, collections: { netlabels: false, etree: false } },
    };

    render(<ArchiveCard initial={off} />);

    expect(screen.queryByText(t.noCollection)).not.toBeInTheDocument();
  });
});
