import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enComponents from "@modules/i18n/messages/en/components.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery, createLoadingQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

import type { QuarantineCardProps } from "../types";

interface QuarantineEntry {
  id: string;
  source: string;
  username: string;
  filename: string;
  externalId: string;
  reason: "wrong_file" | "verify_failed";
  createdAt: Date;
  track: { title: string; artist: string } | null;
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

import { QuarantineCard } from "../QuarantineCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "components", enComponents, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  listQuery = createMockQuery<QuarantineEntry[]>([]);
});

const initial: QuarantineCardProps["initial"] = { metadataConfidenceThreshold: 50, acoustidIdentityGate: true };
const sourceTrust: QuarantineCardProps["sourceTrust"] = { bannedUsersCount: 2, banAfterFailedAttempts: 0 };

const slskdEntry: QuarantineEntry = {
  id: "q1",
  source: "slskd",
  username: "peerA",
  filename: "Music/Artist/Album/01 - Some Very Long Track Name That Should Be Truncated In The Middle.flac",
  externalId: "ext-1",
  reason: "wrong_file",
  createdAt: new Date(Date.now() - 60 * 60 * 1000),
  track: { title: "Song Title", artist: "Some Artist" },
};

const ytdlpEntry: QuarantineEntry = {
  id: "q2",
  source: "ytdlp",
  username: "",
  filename: "https://www.youtube.com/watch?v=abc123",
  externalId: "ext-2",
  reason: "verify_failed",
  createdAt: new Date(Date.now() - 5 * 60 * 1000),
  track: null,
};

describe("QuarantineCard", () => {
  it("renders the identity-gate toggle from the initial settings", () => {
    render(<QuarantineCard initial={initial} sourceTrust={sourceTrust} />);
    expect(screen.getByRole("switch", { name: enSettings.quarantine.identityGate.label })).toBeChecked();
  });

  it("saves the explicit gate value together with the current threshold", async () => {
    render(<QuarantineCard initial={initial} sourceTrust={sourceTrust} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.quarantine.identityGate.label }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(update.mutateAsync).toHaveBeenCalledWith({ metadataConfidenceThreshold: 50, acoustidIdentityGate: false });
  });

  it("renders the list rows with peer, reason, age and resolved track", () => {
    listQuery = createMockQuery<QuarantineEntry[]>([slskdEntry, ytdlpEntry]);
    render(<QuarantineCard initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getByText("peerA")).toBeInTheDocument();
    expect(screen.getByText(enSettings.quarantine.reason.wrong_file)).toBeInTheDocument();
    expect(screen.getByText(enSettings.quarantine.reason.verify_failed)).toBeInTheDocument();
    expect(screen.getByText("Song Title - Some Artist")).toBeInTheDocument();
    expect(screen.getByTitle(slskdEntry.filename)).toBeInTheDocument();
  });

  it("labels an empty-username ytdlp row as YouTube and shows the video URL", () => {
    listQuery = createMockQuery<QuarantineEntry[]>([ytdlpEntry]);
    render(<QuarantineCard initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getAllByText(enSettings.quarantine.list.youtube).length).toBeGreaterThan(0);
    expect(screen.getByText(ytdlpEntry.filename)).toBeInTheDocument();
  });

  it("removes a single entry", async () => {
    listQuery = createMockQuery<QuarantineEntry[]>([slskdEntry]);
    render(<QuarantineCard initial={initial} sourceTrust={sourceTrust} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.quarantine.list.remove }));

    expect(removeEntry.mutate).toHaveBeenCalledWith({ id: slskdEntry.id });
  });

  it("clears all entries after confirmation", async () => {
    listQuery = createMockQuery<QuarantineEntry[]>([slskdEntry, ytdlpEntry]);
    render(<QuarantineCard initial={initial} sourceTrust={sourceTrust} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.quarantine.list.clearAll }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: enSettings.quarantine.list.confirmClear.confirm })
    );

    expect(clearAll.mutate).toHaveBeenCalled();
  });

  it("renders the empty state and hides the clear-all action when there are no entries", () => {
    render(<QuarantineCard initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getByText(enSettings.quarantine.list.empty.title)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enSettings.quarantine.list.clearAll })).not.toBeInTheDocument();
  });

  it("renders the loading state while the list is fetching", () => {
    listQuery = createLoadingQuery<QuarantineEntry[]>();
    render(<QuarantineCard initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getByText(enSettings.quarantine.list.loading)).toBeInTheDocument();
  });

  it("shows the banned-uploaders count and the disabled auto-ban threshold", () => {
    render(<QuarantineCard initial={initial} sourceTrust={sourceTrust} />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(enSettings.quarantine.sourceTrust.autoBan.off)).toBeInTheDocument();
  });
});
