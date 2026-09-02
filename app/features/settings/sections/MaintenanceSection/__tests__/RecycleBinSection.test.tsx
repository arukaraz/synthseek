import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enComponents from "@modules/i18n/messages/en/components.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery, createLoadingQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

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

vi.mock("@hooks/api/mutations/settings/useRecycleBin", () => ({
  useUpdateLibraryRecycleBin: () => updateRecycleBin,
  useEmptyRecycleBin: () => emptyBin,
  useRestoreRecycledFile: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({ data: { library: { recycleBin } } }),
}));

vi.mock("@hooks/api/queries/useRecycleBin", () => ({
  useRecycleBinStatus: () => statusQuery,
  useRecycleBinEntries: () => createMockQuery([]),
}));

import { RecycleBinSection } from "../RecycleBinSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "components", enComponents, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  statusQuery = createMockQuery<RecycleBinStatus>({ totalBytes: 0, entryCount: 0, oldestDate: null });
});

const initial = { upgradeEnabled: true };
const recycleBin = { retentionDays: 30 };

describe("RecycleBinSection", () => {
  it("saves the full library.recycleBin draft without touching the quality settings", async () => {
    render(<RecycleBinSection initial={initial} recycleBin={recycleBin} />);

    fireEvent.change(screen.getByLabelText(enSettings.quality.recycleBin.retentionDays.ariaLabel), {
      target: { value: "90" },
    });
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(updateRecycleBin.mutateAsync).toHaveBeenCalledWith({ retentionDays: 90 });
    });
    expect(updateQuality.mutateAsync).not.toHaveBeenCalled();
  });

  it("renders the recycle bin status with a human-readable size, count and oldest date", () => {
    statusQuery = createMockQuery<RecycleBinStatus>({
      totalBytes: 5 * 1024 * 1024,
      entryCount: 12,
      oldestDate: "2026-07-01",
    });
    render(<RecycleBinSection initial={initial} recycleBin={recycleBin} />);

    expect(screen.getByText("5.0 MB")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("renders a dash for the oldest date when the recycle bin is empty", () => {
    render(<RecycleBinSection initial={initial} recycleBin={recycleBin} />);

    expect(screen.getByText("0 B")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders the loading state while the status is fetching", () => {
    statusQuery = createLoadingQuery<RecycleBinStatus>();
    render(<RecycleBinSection initial={initial} recycleBin={recycleBin} />);

    expect(screen.getByText(enSettings.quality.recycleBin.status.loading)).toBeInTheDocument();
  });

  it("hides the empty action when the recycle bin has no entries", () => {
    render(<RecycleBinSection initial={initial} recycleBin={recycleBin} />);

    expect(screen.queryByRole("button", { name: enSettings.quality.recycleBin.empty.action })).not.toBeInTheDocument();
  });

  it("empties the recycle bin only after confirmation", async () => {
    statusQuery = createMockQuery<RecycleBinStatus>({ totalBytes: 2048, entryCount: 3, oldestDate: "2026-07-15" });
    render(<RecycleBinSection initial={initial} recycleBin={recycleBin} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.quality.recycleBin.empty.action }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: enSettings.quality.recycleBin.empty.confirm }));

    expect(emptyBin.mutate).toHaveBeenCalled();
  });
});
