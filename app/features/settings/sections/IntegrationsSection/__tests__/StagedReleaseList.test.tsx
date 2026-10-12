import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery } from "@test/mocks/trpc.mock";

const removeEntry = createMockMutation();
const clearAll = createMockMutation();
const entries = vi.hoisted(() => {
  const holder: { current: unknown } = { current: undefined };
  return holder;
});

vi.mock("@hooks/api/queries/useStagedReleases", () => ({ useStagedReleases: () => entries.current }));
vi.mock("@hooks/api/mutations/settings/useStagedReleases", () => ({
  useRemoveStagedRelease: () => removeEntry,
  useClearStagedReleases: () => clearAll,
}));

import { StagedReleaseList } from "../StagedReleaseList";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function entry(id: string, source: "usenet" | "torrent", releaseTitle: string) {
  const at = new Date("2026-10-11T12:00:00.000Z");
  return {
    id,
    source,
    releaseTitle,
    sizeBytes: 300_000_000,
    folderName: releaseTitle,
    createdAt: at,
    lastUsedAt: at,
    expiresAt: at,
  };
}

const HOUR_MS = 3_600_000;
const both = [entry("u1", "usenet", "Usenet Album"), entry("t1", "torrent", "Torrent Album")];

describe("StagedReleaseList", () => {
  it("shows only its own source's releases, under that source's heading", () => {
    entries.current = createMockQuery(both);
    render(<StagedReleaseList enabled source="torrent" />);

    expect(screen.getByText(enSettings.torrent.stagedList.title)).toBeInTheDocument();
    expect(screen.getByText("Torrent Album")).toBeInTheDocument();
    expect(screen.queryByText("Usenet Album")).not.toBeInTheDocument();
  });

  it("reads as empty when only the other source has releases waiting", () => {
    entries.current = createMockQuery([entry("u1", "usenet", "Usenet Album")]);
    render(<StagedReleaseList enabled source="torrent" />);

    expect(screen.getByText(enSettings.torrent.stagedList.empty.title)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enSettings.torrent.stagedList.clearAll })).not.toBeInTheDocument();
  });

  it("clears only its own source, after a confirmation that says what clearing does there", async () => {
    entries.current = createMockQuery(both);
    render(<StagedReleaseList enabled source="torrent" />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.torrent.stagedList.clearAll }));
    expect(screen.getByText(enSettings.torrent.stagedList.confirmClear.message)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: enSettings.torrent.stagedList.confirmClear.confirm }));

    expect(clearAll.mutate).toHaveBeenCalledWith({ source: "torrent" });
  });

  it("removes one release by its id, and keeps the Usenet wording for Usenet", async () => {
    entries.current = createMockQuery(both);
    render(<StagedReleaseList enabled source="usenet" />);

    expect(screen.getByText(enSettings.usenet.stagedList.title)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: enSettings.usenet.stagedList.remove }));

    expect(removeEntry.mutate).toHaveBeenCalledWith({ id: "u1" });
  });

  it("says how far ahead a release expires, not that it expired just now", () => {
    const expiring = { ...entry("t1", "torrent", "Torrent Album"), expiresAt: new Date(Date.now() + 23.5 * HOUR_MS) };
    entries.current = createMockQuery([expiring]);
    render(<StagedReleaseList enabled source="torrent" />);

    expect(screen.getByText("expires in 23h")).toBeInTheDocument();
  });
});
