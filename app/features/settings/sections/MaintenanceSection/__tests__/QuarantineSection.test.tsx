import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enComponents from "@modules/i18n/messages/en/components.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery, createLoadingQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface QuarantineEntry {
  source: string;
  username: string;
  filename: string;
  reason: "wrong_file" | "verify_failed";
  createdAt: Date;
  trackCount: number;
  tracks: Array<{ title: string; artist: string }>;
}

const update = createMockMutation();
const removeEntry = createMockMutation();
const clearAll = createMockMutation();
let listQuery: MockQueryResult<QuarantineEntry[]> = createMockQuery<QuarantineEntry[]>([]);

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEngineImport: () => update,
}));

vi.mock("@hooks/api/mutations/settings/useQuarantine", () => ({
  useRemoveQuarantineEntry: () => removeEntry,
  useClearQuarantine: () => clearAll,
}));

vi.mock("@hooks/api/queries/useQuarantine", () => ({
  useQuarantineList: () => listQuery,
}));

import { QuarantineSection } from "../QuarantineSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "components", enComponents, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  listQuery = createMockQuery<QuarantineEntry[]>([]);
});

const initial = { metadataConfidenceThreshold: 50, acoustidIdentityGate: true };
const sourceTrust = { bannedUsersCount: 2, banAfterFailedAttempts: 0 };

const slskdEntry: QuarantineEntry = {
  source: "slskd",
  username: "peerA",
  filename: "Music/Artist/Album/01 - Some Very Long Track Name That Should Be Truncated In The Middle.flac",
  reason: "wrong_file",
  createdAt: new Date(Date.now() - 60 * 60 * 1000),
  trackCount: 1,
  tracks: [{ title: "Song Title", artist: "Some Artist" }],
};

const ytdlpEntry: QuarantineEntry = {
  source: "ytdlp",
  username: "",
  filename: "https://www.youtube.com/watch?v=abc123",
  reason: "verify_failed",
  createdAt: new Date(Date.now() - 5 * 60 * 1000),
  trackCount: 1,
  tracks: [],
};

const brokenRelease: QuarantineEntry = {
  source: "usenet",
  username: "",
  filename: "Radiohead-Pablo Honey-1993-EMG INT",
  reason: "verify_failed",
  createdAt: new Date(Date.now() - 2 * 60 * 1000),
  trackCount: 12,
  tracks: [
    { title: "You", artist: "Radiohead" },
    { title: "Creep", artist: "Radiohead" },
  ],
};

describe("QuarantineSection", () => {
  it("renders the identity-gate toggle from the initial settings", () => {
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);
    expect(screen.getByRole("switch", { name: enSettings.quarantine.identityGate.label })).toBeChecked();
  });

  it("saves the explicit gate value together with the current threshold", async () => {
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.quarantine.identityGate.label }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(update.mutateAsync).toHaveBeenCalledWith({ metadataConfidenceThreshold: 50, acoustidIdentityGate: false });
  });

  it("renders the list rows with peer, reason, age and resolved track", () => {
    listQuery = createMockQuery<QuarantineEntry[]>([slskdEntry, ytdlpEntry]);
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getByText("peerA")).toBeInTheDocument();
    expect(screen.getByText(enSettings.quarantine.reason.wrong_file)).toBeInTheDocument();
    expect(screen.getByText(enSettings.quarantine.reason.verify_failed)).toBeInTheDocument();
    expect(screen.getByText("Song Title - Some Artist")).toBeInTheDocument();
    expect(screen.getByTitle(slskdEntry.filename)).toBeInTheDocument();
  });

  it("shows a ytdlp row as its source and video URL without a peer label", () => {
    listQuery = createMockQuery<QuarantineEntry[]>([ytdlpEntry]);
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getAllByText(enSettings.quarantine.source.ytdlp).length).toBe(1);
    expect(screen.getByText(ytdlpEntry.filename)).toBeInTheDocument();
    expect(screen.queryByTitle(enSettings.quarantine.list.columns.peer)).not.toBeInTheDocument();
  });

  it("removes a single entry", async () => {
    listQuery = createMockQuery<QuarantineEntry[]>([slskdEntry]);
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.quarantine.list.remove }));

    expect(removeEntry.mutate).toHaveBeenCalledWith({
      source: slskdEntry.source,
      username: slskdEntry.username,
      filename: slskdEntry.filename,
    });
  });

  it("shows a release set aside for many tracks once, with its tracks folded behind a count", async () => {
    listQuery = createMockQuery<QuarantineEntry[]>([brokenRelease]);
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getAllByTitle(brokenRelease.filename)).toHaveLength(1);
    const toggle = screen.getByRole("button", { name: /12 tracks/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Creep - Radiohead")).not.toBeInTheDocument();

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("You - Radiohead")).toBeInTheDocument();
    expect(screen.getByText("Creep - Radiohead")).toBeInTheDocument();
  });

  it("lifts a release for all of its tracks with one removal", async () => {
    listQuery = createMockQuery<QuarantineEntry[]>([brokenRelease]);
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.quarantine.list.remove }));

    expect(removeEntry.mutate).toHaveBeenCalledTimes(1);
    expect(removeEntry.mutate).toHaveBeenCalledWith({
      source: "usenet",
      username: "",
      filename: brokenRelease.filename,
    });
  });

  it("clears all entries after confirmation", async () => {
    listQuery = createMockQuery<QuarantineEntry[]>([slskdEntry, ytdlpEntry]);
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.quarantine.list.clearAll }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: enSettings.quarantine.list.confirmClear.confirm })
    );

    expect(clearAll.mutate).toHaveBeenCalled();
  });

  it("renders the empty state and hides the clear-all action when there are no entries", () => {
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getByText(enSettings.quarantine.list.empty.title)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enSettings.quarantine.list.clearAll })).not.toBeInTheDocument();
  });

  it("renders the loading state while the list is fetching", () => {
    listQuery = createLoadingQuery<QuarantineEntry[]>();
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getByText(enSettings.quarantine.list.loading)).toBeInTheDocument();
  });

  it("shows the banned-uploaders count and the disabled auto-ban threshold", () => {
    render(<QuarantineSection initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(enSettings.quarantine.sourceTrust.autoBan.off)).toBeInTheDocument();
  });
});
