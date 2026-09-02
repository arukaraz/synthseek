import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enComponents from "@modules/i18n/messages/en/components.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

import type { QualityCardProps } from "../types";

interface RecycleBinStatus {
  totalBytes: number;
  entryCount: number;
  oldestDate: string | null;
}

const updateQuality = createMockMutation();
const updateRecycleBin = createMockMutation();
const emptyBin = createMockMutation();
let statusQuery: MockQueryResult<RecycleBinStatus> = createMockQuery<RecycleBinStatus>({
  totalBytes: 0,
  entryCount: 0,
  oldestDate: null,
});

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEngineQuality: () => updateQuality,
}));

vi.mock("@hooks/api/mutations/settings/useRecycleBin", () => ({
  useUpdateLibraryRecycleBin: () => updateRecycleBin,
  useEmptyRecycleBin: () => emptyBin,
  useRestoreRecycledFile: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@hooks/api/queries/useRecycleBin", () => ({
  useRecycleBinStatus: () => statusQuery,
  useRecycleBinEntries: () => createMockQuery([]),
}));

import { QualityCard } from "../QualityCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "components", enComponents, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  statusQuery = createMockQuery<RecycleBinStatus>({ totalBytes: 0, entryCount: 0, oldestDate: null });
});

const initial: QualityCardProps["initial"] = { upgradeEnabled: true };
const recycleBin: QualityCardProps["recycleBin"] = { retentionDays: 30 };

describe("QualityCard", () => {
  it("renders the upgrade toggle from the initial settings", () => {
    render(<QualityCard initial={initial} recycleBin={recycleBin} />);
    expect(screen.getByRole("switch", { name: enSettings.quality.upgradeEnabled.label })).toBeChecked();
  });

  it("saves the full engine.quality draft without touching the recycle bin settings", async () => {
    render(<QualityCard initial={initial} recycleBin={recycleBin} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.quality.upgradeEnabled.label }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(updateQuality.mutateAsync).toHaveBeenCalledWith({ upgradeEnabled: false });
    });
    expect(updateRecycleBin.mutateAsync).not.toHaveBeenCalled();
  });
});
