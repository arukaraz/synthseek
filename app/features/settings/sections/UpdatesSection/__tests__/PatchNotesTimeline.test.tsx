import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createLoadingQuery, createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";
import { PATCH_NOTES_URL } from "@utils/version";

import type { PatchNotes } from "../types";
import { makeEntry } from "./fixtures";

type CurrentVersion = { currentVersion: string };

const patchNotesData: PatchNotes = {
  schemaVersion: 1,
  versions: [
    makeEntry({ version: "2.3.0", title: "Latest release" }),
    makeEntry({ version: "2.2.0", title: "Older release" }),
  ],
};

let patchNotesQuery: MockQueryResult<PatchNotes | undefined> = createMockQuery<PatchNotes | undefined>(patchNotesData);
let currentQuery: MockQueryResult<CurrentVersion | undefined> = createMockQuery<CurrentVersion | undefined>({
  currentVersion: "2.2.0",
});

vi.mock("@hooks/api/queries/usePatchNotes", () => ({
  usePatchNotes: () => patchNotesQuery,
}));

vi.mock("@hooks/api/queries/useCurrentVersion", () => ({
  useCurrentVersion: () => currentQuery,
}));

import { PatchNotesTimeline } from "../PatchNotesTimeline";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  patchNotesQuery = createMockQuery<PatchNotes | undefined>(patchNotesData);
  currentQuery = createMockQuery<CurrentVersion | undefined>({ currentVersion: "2.2.0" });
});

describe("PatchNotesTimeline", () => {
  it("shows the loading spinner while patch notes are loading", () => {
    patchNotesQuery = createLoadingQuery<PatchNotes>();
    render(<PatchNotesTimeline />);
    expect(screen.getByText(enSettings.updates.notes.loading)).toBeInTheDocument();
  });

  it("shows the empty state when there are no versions", () => {
    patchNotesQuery = createMockQuery<PatchNotes>({ schemaVersion: 1, versions: [] });
    render(<PatchNotesTimeline />);
    expect(screen.getByText(enSettings.updates.notes.empty)).toBeInTheDocument();
  });

  it("renders one timeline entry per version", () => {
    render(<PatchNotesTimeline />);
    expect(screen.getByText("Latest release")).toBeInTheDocument();
    expect(screen.getByText("Older release")).toBeInTheDocument();
    expect(screen.getByText("v2.3.0")).toBeInTheDocument();
  });

  it("marks the running version as current", () => {
    render(<PatchNotesTimeline />);
    expect(screen.getByText(enSettings.updates.badge.current)).toBeInTheDocument();
  });

  it("marks the newest version as latest when the current version is unknown", () => {
    currentQuery = createMockQuery<CurrentVersion | undefined>(undefined);
    render(<PatchNotesTimeline />);
    expect(screen.getByText(enSettings.updates.badge.new)).toBeInTheDocument();
    expect(screen.queryByText(enSettings.updates.badge.current)).not.toBeInTheDocument();
  });

  it("renders the older-releases link pointing at the changelog", () => {
    render(<PatchNotesTimeline />);
    const link = screen.getByRole("link", { name: enSettings.updates.notes.olderOnGitHub });
    expect(link).toHaveAttribute("href", PATCH_NOTES_URL);
    expect(link).toHaveAttribute("target", "_blank");
  });
});
