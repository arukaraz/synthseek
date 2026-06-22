import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery } from "@test/mocks/trpc.mock";

import type { PatchNotes, UpdateCheckResult } from "../types";
import { makeEntry } from "./fixtures";

const patchNotesData: PatchNotes = {
  schemaVersion: 1,
  versions: [makeEntry({ version: "2.3.0", title: "Latest release" })],
};

const checkData: UpdateCheckResult = {
  currentVersion: "2.3.0",
  latestVersion: "2.3.0",
  updateAvailable: false,
  checkedAt: new Date("2026-06-22T00:00:00Z"),
};

vi.mock("@hooks/api/queries/usePatchNotes", () => ({
  usePatchNotes: () => createMockQuery(patchNotesData),
}));

vi.mock("@hooks/api/queries/useCurrentVersion", () => ({
  useCurrentVersion: () => createMockQuery({ currentVersion: "2.3.0" }),
}));

vi.mock("@hooks/api/queries/useUpdateCheck", () => ({
  useUpdateCheck: () => createMockQuery(checkData),
}));

import { UpdatesSection } from "../UpdatesSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UpdatesSection", () => {
  it("composes the header and the patch notes timeline", () => {
    render(<UpdatesSection />);
    expect(screen.getByText(enSettings.updates.page.title)).toBeInTheDocument();
    expect(screen.getByText("Latest release")).toBeInTheDocument();
  });
});
