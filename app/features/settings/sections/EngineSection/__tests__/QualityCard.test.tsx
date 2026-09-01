import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enComponents from "@modules/i18n/messages/en/components.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery, createLoadingQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

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

  it("saves the full library.recycleBin draft without touching the quality settings", async () => {
    render(<QualityCard initial={initial} recycleBin={recycleBin} />);

    fireEvent.change(screen.getByLabelText(enSettings.quality.recycleBin.retentionDays.ariaLabel), {
      target: { value: "90" },
    });
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(updateRecycleBin.mutateAsync).toHaveBeenCalledWith({ retentionDays: 90 });
    });
    expect(updateQuality.mutateAsync).not.toHaveBeenCalled();
  });

  it("shows independent save bars when both drafts are dirty", async () => {
    render(<QualityCard initial={initial} recycleBin={recycleBin} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.quality.upgradeEnabled.label }));
    fireEvent.change(screen.getByLabelText(enSettings.quality.recycleBin.retentionDays.ariaLabel), {
      target: { value: "7" },
    });

    const saveButtons = screen.getAllByRole("button", { name: enSettings.shell.saveBar.save });
    expect(saveButtons).toHaveLength(2);

    await userEvent.click(saveButtons[1]);
    await waitFor(() => {
      expect(updateRecycleBin.mutateAsync).toHaveBeenCalledWith({ retentionDays: 7 });
    });
    expect(updateQuality.mutateAsync).not.toHaveBeenCalled();
  });

  it("renders the recycle bin status with a human-readable size, count and oldest date", () => {
    statusQuery = createMockQuery<RecycleBinStatus>({
      totalBytes: 5 * 1024 * 1024,
      entryCount: 12,
      oldestDate: "2026-07-01",
    });
    render(<QualityCard initial={initial} recycleBin={recycleBin} />);

    expect(screen.getByText("5.0 MB")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("renders a dash for the oldest date when the recycle bin is empty", () => {
    render(<QualityCard initial={initial} recycleBin={recycleBin} />);

    expect(screen.getByText("0 B")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders the loading state while the status is fetching", () => {
    statusQuery = createLoadingQuery<RecycleBinStatus>();
    render(<QualityCard initial={initial} recycleBin={recycleBin} />);

    expect(screen.getByText(enSettings.quality.recycleBin.status.loading)).toBeInTheDocument();
  });

  it("hides the empty action when the recycle bin has no entries", () => {
    render(<QualityCard initial={initial} recycleBin={recycleBin} />);

    expect(screen.queryByRole("button", { name: enSettings.quality.recycleBin.empty.action })).not.toBeInTheDocument();
  });

  it("empties the recycle bin only after confirmation", async () => {
    statusQuery = createMockQuery<RecycleBinStatus>({ totalBytes: 2048, entryCount: 3, oldestDate: "2026-07-15" });
    render(<QualityCard initial={initial} recycleBin={recycleBin} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.quality.recycleBin.empty.action }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: enSettings.quality.recycleBin.empty.confirm }));

    expect(emptyBin.mutate).toHaveBeenCalled();
  });
});
