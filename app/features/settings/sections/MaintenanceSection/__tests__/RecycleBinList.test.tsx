import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

type Entry = {
  id: string;
  recycledOn: string;
  relativePath: string;
  fileName: string;
  sizeBytes: number;
};

let entriesQuery: MockQueryResult<Entry[] | undefined> = createMockQuery<Entry[] | undefined>([]);
const restoreMutate = vi.fn();
let enabledWith: boolean | null = null;

vi.mock("@hooks/api/queries/useRecycleBin", () => ({
  useRecycleBinEntries: (enabled: boolean) => {
    enabledWith = enabled;
    return entriesQuery;
  },
}));

vi.mock("@hooks/api/mutations/settings/useRecycleBin", () => ({
  useRestoreRecycledFile: () => ({ mutate: restoreMutate, isPending: false }),
}));

import { RecycleBinList } from "../RecycleBinList";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  enabledWith = null;
  entriesQuery = createMockQuery<Entry[] | undefined>([]);
});

function entry(overrides: Partial<Entry> = {}): Entry {
  const name = overrides.fileName ?? "11 - Bohemian Rhapsody.mp3";
  return {
    id: `2026-09-01/Queen/A Night at the Opera/${name}`,
    recycledOn: "2026-09-01",
    relativePath: `Queen/A Night at the Opera/${name}`,
    fileName: name,
    sizeBytes: 9_400_000,
    ...overrides,
  };
}

function expand() {
  fireEvent.click(screen.getByRole("button", { name: /show the/i }));
}

describe("RecycleBinList", () => {
  it("stays out of the way entirely when the bin is empty", () => {
    render(<RecycleBinList entryCount={0} />);

    expect(screen.queryByRole("button", { name: /show the/i })).not.toBeInTheDocument();
  });

  it("does not fetch the listing until the reader opens it", () => {
    entriesQuery = createMockQuery<Entry[] | undefined>([entry()]);
    render(<RecycleBinList entryCount={1} />);

    expect(enabledWith).toBe(false);

    expand();

    expect(enabledWith).toBe(true);
  });

  it("names each file and where it would go back to, since that is the whole decision", () => {
    entriesQuery = createMockQuery<Entry[] | undefined>([entry()]);
    render(<RecycleBinList entryCount={1} />);
    expand();

    expect(screen.getByText("11 - Bohemian Rhapsody.mp3")).toBeInTheDocument();
    expect(screen.getByText("Queen/A Night at the Opera/")).toBeInTheDocument();
    expect(screen.queryByText(/Opera\/11 - Bohemian/)).not.toBeInTheDocument();
    expect(screen.getByText(/9\.0 MB · 2026-09-01/)).toBeInTheDocument();
  });

  it("restores the entry the reader picked, by its own id", () => {
    entriesQuery = createMockQuery<Entry[] | undefined>([entry(), entry({ fileName: "02 - Other.mp3" })]);
    render(<RecycleBinList entryCount={2} />);
    expand();

    const [, second] = screen.getAllByRole("button", { name: enSettings.quality.recycleBin.list.restore });
    fireEvent.click(second);

    expect(restoreMutate).toHaveBeenCalledWith({ id: "2026-09-01/Queen/A Night at the Opera/02 - Other.mp3" });
  });

  it("hands a long bin to the shared pager rather than rendering every file at once", () => {
    entriesQuery = createMockQuery<Entry[] | undefined>(
      Array.from({ length: 25 }, (_, index) => entry({ fileName: `${index} - Track.mp3` }))
    );
    render(<RecycleBinList entryCount={25} />);
    expand();

    expect(screen.getByRole("button", { name: /next page/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: enSettings.quality.recycleBin.list.restore })).toHaveLength(10);
  });

  it("says it is loading rather than showing an empty bin while the listing arrives", () => {
    entriesQuery = createLoadingQuery<Entry[] | undefined>();
    render(<RecycleBinList entryCount={3} />);
    expand();

    expect(screen.queryByRole("button", { name: enSettings.quality.recycleBin.list.restore })).not.toBeInTheDocument();
  });
});
