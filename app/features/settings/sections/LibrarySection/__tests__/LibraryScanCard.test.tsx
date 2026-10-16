import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

type ScanRun = {
  state: string;
  walkClean: boolean;
  walkFailures: number;
  terminalCode: string | null;
  startedAt: Date;
  finishedAt: Date | null;
};

type Inventory = {
  indexedFiles: number;
  linkedFiles: number;
  searchingFiles: number;
  reviewFiles: number;
  ignoredFiles: number;
  missingFiles: number;
};

type ScanPath = Inventory & {
  id: string;
  label: string;
  folder: string;
  enabled: boolean;
  scanning: boolean;
  lastScanAt: string | null;
  lastScanOutcome: "reconciled" | "unavailable" | "disabled" | "unreadable" | "empty" | null;
};

type ScanStatus = {
  identifyRunning: boolean;
  reclaimRunning: boolean;
  activeRun: ScanRun | null;
  lastRun: ScanRun | null;
  inventory: Inventory;
  paths: ScanPath[];
};

const urlParam = vi.hoisted(() => ({ value: undefined as string | undefined, set: vi.fn() }));

vi.mock("@hooks/ui/useUrlParam", () => ({
  useUrlParam: () => [urlParam.value, urlParam.set],
}));

vi.mock("@features/unidentified-files", () => ({
  REVIEW_URL_PARAM: "review",
  REVIEW_URL_VALUE: "files",
  UnidentifiedFilesModal: ({ open }: { open: boolean }) => (open ? <div>review modal open</div> : null),
}));

let statusQuery: MockQueryResult<ScanStatus | undefined> = createMockQuery<ScanStatus | undefined>(undefined);
const cancelMutate = vi.fn();
const triggerMutate = vi.fn();
const scanPathMutate = vi.fn();

vi.mock("@hooks/api/mutations/jobs/useTriggerJob", () => ({
  useTriggerJob: () => ({ mutate: triggerMutate, isPending: false }),
}));

vi.mock("@hooks/api/queries/useLibraryScanStatus", () => ({
  useLibraryScanStatus: () => statusQuery,
  useDuplicateGroups: () => createMockQuery({ groups: [], totalBytes: 0 }),
}));

vi.mock("@hooks/api/mutations/jobs/useLibraryScanControls", () => ({
  useCancelLibraryScan: () => ({ mutate: cancelMutate, isPending: false }),
  useKeepThisCopy: () => ({ mutate: vi.fn(), isPending: false }),
  useKeepBestLibraryCopies: () => ({ mutate: vi.fn(), isPending: false }),
  useKeepBestLibraryCopy: () => ({ mutate: vi.fn(), isPending: false }),
  useScanLibraryPath: () => ({ mutate: scanPathMutate, isPending: false }),
}));

import { SETTINGS_SEARCH_ENTRIES } from "../../../components/SettingsSearch";
import { LibraryScanCard } from "../LibraryScanCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  statusQuery = createMockQuery<ScanStatus | undefined>(undefined);
});

function makeRun(overrides: Partial<ScanRun> = {}): ScanRun {
  return {
    state: "completed",
    walkClean: true,
    walkFailures: 0,
    terminalCode: null,
    startedAt: new Date(Date.now() - 10 * 60 * 1000),
    finishedAt: new Date(Date.now() - 9 * 60 * 1000),
    ...overrides,
  };
}

function makePath(overrides: Partial<ScanPath> = {}): ScanPath {
  return {
    id: "primary",
    label: "Music",
    folder: "/music",
    enabled: true,
    scanning: false,
    lastScanAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    lastScanOutcome: "reconciled",
    indexedFiles: 8334,
    linkedFiles: 5451,
    searchingFiles: 2747,
    reviewFiles: 136,
    ignoredFiles: 0,
    missingFiles: 0,
    ...overrides,
  };
}

function makeStatus(overrides: Partial<ScanStatus> = {}): ScanStatus {
  return {
    identifyRunning: false,
    reclaimRunning: false,
    activeRun: null,
    lastRun: makeRun(),
    inventory: {
      indexedFiles: 8334,
      linkedFiles: 5451,
      searchingFiles: 2747,
      reviewFiles: 136,
      ignoredFiles: 0,
      missingFiles: 0,
    },
    paths: [makePath()],
    ...overrides,
  };
}

describe("LibraryScanCard", () => {
  it("shows how much of the disk each library path covers", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({
        paths: [
          makePath(),
          makePath({
            id: "archive",
            label: "Archive",
            folder: "/mnt/archive",
            indexedFiles: 412,
            linkedFiles: 400,
            searchingFiles: 3,
            reviewFiles: 9,
            missingFiles: 7,
          }),
        ],
      })
    );

    render(<LibraryScanCard />);

    const music = screen.getByRole("row", { name: /Music/ });
    expect(within(music).getByText("8,334")).toBeInTheDocument();
    expect(within(music).getByText("5,451")).toBeInTheDocument();
    expect(within(music).getByText("2,747")).toBeInTheDocument();
    expect(within(music).getByText("136")).toBeInTheDocument();
    const archive = screen.getByRole("row", { name: /Archive/ });
    expect(within(archive).getByText("/mnt/archive")).toBeInTheDocument();
    expect(within(archive).getByText("412")).toBeInTheDocument();
    expect(within(archive).getByText("7")).toBeInTheDocument();
  });

  it("scans one library path from its own row", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({ paths: [makePath(), makePath({ id: "archive", label: "Archive" })] })
    );

    render(<LibraryScanCard />);
    fireEvent.click(screen.getByRole("button", { name: "Scan Archive" }));

    expect(scanPathMutate).toHaveBeenCalledWith({ pathId: "archive" }, expect.anything());
  });

  it("cannot scan a disabled path, and says why its last scan was skipped", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({
        paths: [
          makePath(),
          makePath({ id: "nas", label: "NAS", enabled: false, lastScanOutcome: "disabled" }),
          makePath({ id: "usb", label: "USB", lastScanOutcome: "unavailable" }),
        ],
      })
    );

    render(<LibraryScanCard />);

    expect(screen.getByRole("button", { name: "Scan NAS" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Scan USB" })).toBeEnabled();
    expect(within(screen.getByRole("row", { name: /NAS/ })).getByText("Skipped, disabled")).toBeInTheDocument();
    expect(within(screen.getByRole("row", { name: /USB/ })).getByText("Skipped, not reachable")).toBeInTheDocument();
  });

  it("marks a path never scanned and one scanning right now", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({
        paths: [
          makePath({ lastScanAt: null, lastScanOutcome: null }),
          makePath({ id: "b", label: "B", scanning: true }),
        ],
      })
    );

    render(<LibraryScanCard />);

    expect(within(screen.getByRole("row", { name: /Music/ })).getByText("Never")).toBeInTheDocument();
    expect(within(screen.getByRole("row", { name: /^B/ })).getByText("Scanning")).toBeInTheDocument();
  });

  it("opens the review from a button that counts the files waiting for a decision", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);
    fireEvent.click(
      screen.getByRole("button", { name: i18n.t("settings:libraryScan.stats.reviewFilesCount", { count: 136 }) })
    );

    expect(urlParam.set).toHaveBeenCalledWith("files");
  });

  it("lets the settings search scroll to the card", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    const anchor = SETTINGS_SEARCH_ENTRIES.find((entry) => entry.labelKey === "libraryScan.card.title")?.anchor;
    expect(anchor).toBeDefined();
    expect(screen.getByText(enSettings.libraryScan.card.title).closest("section")).toHaveAttribute(
      "data-anchor-target",
      anchor
    );
  });

  it("offers no review when nothing waits for one", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({
        inventory: {
          indexedFiles: 10,
          linkedFiles: 10,
          searchingFiles: 0,
          reviewFiles: 0,
          ignoredFiles: 0,
          missingFiles: 0,
        },
      })
    );

    render(<LibraryScanCard />);

    expect(
      screen.queryByRole("button", { name: i18n.t("settings:libraryScan.stats.reviewFilesCount", { count: 0 }) })
    ).not.toBeInTheDocument();
  });

  it("keeps ignored files reachable from the line under the counts", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({
        inventory: {
          indexedFiles: 10,
          linkedFiles: 9,
          searchingFiles: 0,
          reviewFiles: 0,
          ignoredFiles: 1,
          missingFiles: 2,
        },
      })
    );

    render(<LibraryScanCard />);
    fireEvent.click(screen.getByRole("button", { name: "1 file ignored" }));

    expect(urlParam.set).toHaveBeenCalledWith("files");
  });

  it("shows the review while the address asks for it", () => {
    urlParam.value = "files";
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.getByText("review modal open")).toBeInTheDocument();
    urlParam.value = undefined;
  });

  it("no longer offers duplicates here, since Maintenance owns them and counts tracks not copies", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.queryByRole("button", { name: "325" })).not.toBeInTheDocument();
    expect(screen.queryByText(/3\.1 GB/)).not.toBeInTheDocument();
  });

  it("says in the header how long ago the last scan finished", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.getByText(/ran /i)).toBeInTheDocument();
  });

  it("says so when the library has never been scanned", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ lastRun: null }));

    render(<LibraryScanCard />);

    expect(screen.getByText(enSettings.libraryScan.header.never)).toBeInTheDocument();
  });

  it("no longer prints the indexed size, the format tally or the orphan count", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.queryByText(/indexed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/MP3/)).not.toBeInTheDocument();
    expect(screen.queryByText(/no file on disk/i)).not.toBeInTheDocument();
  });

  it("warns that nothing was marked gone when the walk could not read everything", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({ lastRun: makeRun({ walkClean: false, walkFailures: 3 }) })
    );

    render(<LibraryScanCard />);

    expect(screen.getByText(enSettings.libraryScan.warning.dirtyWalk.title)).toBeInTheDocument();
    expect(screen.getByText(/3 paths could not be read/)).toBeInTheDocument();
  });

  it("does not warn after a walk that read everything", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    expect(screen.queryByText(enSettings.libraryScan.warning.dirtyWalk.title)).not.toBeInTheDocument();
  });

  it("starts a scan from the card itself", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());

    render(<LibraryScanCard />);

    fireEvent.click(screen.getByRole("button", { name: /run .*library scan/i }));

    expect(triggerMutate).toHaveBeenCalledWith({ id: "library-scan" }, expect.anything());
  });

  it("shows the run button as busy while a scan is in flight, not merely while the click resolves", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ activeRun: makeRun({ state: "scanning" }) }));

    render(<LibraryScanCard />);

    const button = screen.getByRole("button", { name: /running library scan/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(enSettings.libraryScan.header.running)).toBeInTheDocument();
  });

  it("shows the button busy while identification is working, even with no disk walk in flight", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ identifyRunning: true, activeRun: null }));

    render(<LibraryScanCard />);

    const button = screen.getByRole("button", { name: /running library scan/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(enSettings.libraryScan.header.identifying)).toBeInTheDocument();
  });

  it("says it is scanning, not identifying, while the disk walk is the part that is running", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(
      makeStatus({ activeRun: makeRun({ state: "scanning" }), identifyRunning: true })
    );

    render(<LibraryScanCard />);

    expect(screen.getByText(enSettings.libraryScan.header.running)).toBeInTheDocument();
    expect(screen.queryByText(enSettings.libraryScan.header.identifying)).not.toBeInTheDocument();
  });

  it("shows the button busy while duplicates are being settled, since a scan would refuse to start", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ reclaimRunning: true }));

    render(<LibraryScanCard />);

    expect(screen.getByRole("button", { name: /running library scan/i })).toBeDisabled();
  });

  it("offers cancelling only while a scan is running", () => {
    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus());
    const { unmount } = render(<LibraryScanCard />);
    expect(screen.queryByRole("button", { name: enSettings.libraryScan.actions.cancel })).not.toBeInTheDocument();
    unmount();

    statusQuery = createMockQuery<ScanStatus | undefined>(makeStatus({ activeRun: makeRun({ state: "scanning" }) }));
    render(<LibraryScanCard />);

    fireEvent.click(screen.getByRole("button", { name: enSettings.libraryScan.actions.cancel }));
    expect(cancelMutate).toHaveBeenCalled();
  });

  it("reports a load failure instead of rendering an empty card", () => {
    statusQuery = createErrorQuery<ScanStatus | undefined>(new Error("boom"));

    render(<LibraryScanCard />);

    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it("shows a loading note while the status is still coming", () => {
    statusQuery = createLoadingQuery<ScanStatus | undefined>();

    render(<LibraryScanCard />);

    expect(screen.getByText(enSettings.jobs.card.loading)).toBeInTheDocument();
  });
});
