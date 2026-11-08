import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ColumnDef } from "@components/ui/Table";
import type { ReactNode } from "react";
import { createLibraryShell } from "@test/factories";
import { renderWithProviders, screen } from "@test/test-utils";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { useLibrarySelection } from "../../hooks/useLibrarySelection";
import type { LibraryViewShell, TracksViewModeProps } from "../../types";
import type { TrackSelectionConfig } from "../LibraryTable/types";

import { TracksViewMode } from "../TracksViewMode";

const useLibraryTracksMock = vi.hoisted(() => vi.fn());
const prefetchNextPageMock = vi.hoisted(() => vi.fn());
const libraryPlaybackMock = vi.hoisted(() => vi.fn(() => ({ play: vi.fn(), enqueue: vi.fn() })));

vi.mock("../../hooks/useLibraryPlayback", () => ({ useLibraryPlayback: libraryPlaybackMock }));

vi.mock("../../hooks/useLibraryTrackActions", () => ({
  useLibraryTrackActions: () => ({
    retryFailed: vi.fn(),
    isRetrying: false,
    searchBetterQuality: vi.fn(),
    isUpgrading: false,
  }),
}));

vi.mock("@hooks/api", () => ({
  useLibraryTracks: useLibraryTracksMock,
  useLibraryTracksPrefetch: () => ({ prefetchNextPage: prefetchNextPageMock }),
  usePlayableTracksFetcher: () => vi.fn(async () => ({ items: [], truncated: false })),
  useRadioTracksFetcher: () => vi.fn(async () => ({ items: [] })),
}));

vi.mock("../AddToPlaylistDropdown", () => ({ AddToPlaylistDropdown: () => null }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: false, currentUser: null, isLoading: false }),
}));

interface CapturedLayout {
  items: LibraryTrackItem[] | undefined;
  total: number;
  isLoading: boolean;
  isError: boolean;
  content: {
    layout: "table";
    columns: ColumnDef<LibraryTrackItem>[];
    getRowId: (item: LibraryTrackItem) => string;
    selection?: TrackSelectionConfig;
    rows?: ReactNode;
  };
}

const captured: { props?: CapturedLayout } = {};

vi.mock("../LibraryViewLayout/LibraryViewLayout", async () => {
  const { LibraryTable } =
    await vi.importActual<typeof import("../LibraryTable/LibraryTable")>("../LibraryTable/LibraryTable");
  return {
    LibraryViewLayout: (props: CapturedLayout) => {
      captured.props = props;
      return (
        <div data-testid="layout">
          layout:{props.content.layout}
          <LibraryTable
            items={props.items ?? []}
            columns={props.content.columns}
            getRowId={props.content.getRowId}
            emptyMessage=""
            selection={props.content.selection}
            rows={props.content.rows}
          />
        </div>
      );
    },
  };
});

function createTrack(): LibraryTrackItem {
  return {
    id: "trk-1",
    external_id: "ext-1",
    title: "Aerodynamic",
    artist: "Daft Punk",
    status: "complete",
    source: "deezer",
    format: "flac",
    request_type: "track",
    bitrate: 1411,
    file_bitrate: null,
    file_format: null,
    playable: true,
    sources: [],
    duration_ms: 212000,
    track_number: 3,
    disc_number: 1,
    explicit: false,
    album_id: "alb-1",
    albumName: "Discovery",
    albumArt: null,
    genres: ["electronic"],
    playlistIds: [],
    replayGain: { trackGain: null, albumGain: null, trackPeak: null, albumPeak: null },
    libraryPath: null,
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    completed_at: null,
  };
}

type HarnessProps = Omit<TracksViewModeProps, "selection">;

function TracksHarness(props: HarnessProps) {
  const selection = useLibrarySelection();
  return <TracksViewMode {...props} selection={selection} />;
}

function makeProps(
  overrides?: Partial<TracksViewModeProps["controller"]>,
  shell?: Partial<LibraryViewShell>
): HarnessProps {
  return {
    controller: {
      view: "tracks",
      search: "",
      sort: "recent",
      direction: undefined,
      filters: {},
      facetSearch: {},
      page: 1,
      pageSize: 50,
      ...overrides,
    } as unknown as TracksViewModeProps["controller"],
    shell: createLibraryShell(shell),
    fileActions: { canMove: true, openMove: vi.fn(), openDelete: vi.fn() },
  };
}

describe("TracksViewMode", () => {
  beforeEach(() => {
    captured.props = undefined;
    prefetchNextPageMock.mockReset();
    useLibraryTracksMock.mockReturnValue({
      data: { items: [createTrack()], total: 1, facets: {} },
      isLoading: false,
      isError: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders a table layout and gates the tracks query on the active view", () => {
    renderWithProviders(<TracksHarness {...makeProps()} />);

    expect(screen.getByTestId("layout")).toHaveTextContent("layout:table");
    expect(useLibraryTracksMock).toHaveBeenCalledWith(expect.anything(), true);
  });

  it("does not prefetch when the current page is the last page", () => {
    renderWithProviders(<TracksHarness {...makeProps()} />);

    expect(prefetchNextPageMock).not.toHaveBeenCalled();
  });

  it("prefetches the next page when more results remain", () => {
    useLibraryTracksMock.mockReturnValue({
      data: { items: [createTrack()], total: 120, facets: {} },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<TracksHarness {...makeProps()} />);

    expect(prefetchNextPageMock).toHaveBeenCalledTimes(1);
    expect(prefetchNextPageMock).toHaveBeenCalledWith(expect.anything(), 50);
  });

  it("plays from the sources the server filtered by, not the ones the url asks for", () => {
    useLibraryTracksMock.mockReturnValue({
      data: { items: [createTrack()], total: 1, facets: {}, appliedSources: [] },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<TracksHarness {...makeProps({ filters: { source: ["navidrome"] } })} />);

    expect(libraryPlaybackMock).toHaveBeenLastCalledWith(expect.any(Array), []);
  });

  it("hands the applied sources to playback in the order the server reports them", () => {
    useLibraryTracksMock.mockReturnValue({
      data: { items: [createTrack()], total: 1, facets: {}, appliedSources: ["jellyfin", "local"] },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<TracksHarness {...makeProps({ filters: { source: ["jellyfin", "local", "gone"] } })} />);

    expect(libraryPlaybackMock).toHaveBeenLastCalledWith(expect.any(Array), ["jellyfin", "local"]);
  });

  it("forwards the total and loading state to the layout", () => {
    renderWithProviders(<TracksHarness {...makeProps()} />);

    expect(captured.props?.total).toBe(1);
    expect(captured.props?.isLoading).toBe(false);
    expect(captured.props?.isError).toBe(false);
  });

  it("derives a table row id from the track id", () => {
    renderWithProviders(<TracksHarness {...makeProps()} />);

    expect(captured.props?.content.getRowId(createTrack())).toBe("trk-1");
  });

  it("keeps the select column on a desktop", () => {
    renderWithProviders(<TracksHarness {...makeProps()} />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("lists rows with artist and album on a phone, playing the track on tap, with no checkboxes", async () => {
    const play = vi.fn();
    libraryPlaybackMock.mockReturnValue({ play, enqueue: vi.fn() });
    const { user } = renderWithProviders(<TracksHarness {...makeProps(undefined, { phone: true })} />);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Daft Punk · Discovery")).toBeInTheDocument();
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);

    await user.click(screen.getByText("Aerodynamic"));

    expect(play).toHaveBeenCalledWith("trk-1");
  });

  it("toggles a row instead of playing it on a phone in select mode", async () => {
    const play = vi.fn();
    libraryPlaybackMock.mockReturnValue({ play, enqueue: vi.fn() });
    const { user } = renderWithProviders(
      <TracksHarness {...makeProps(undefined, { phone: true, selectMode: true })} />
    );
    const row = screen.getByRole("button", { name: "Select Aerodynamic" });

    expect(row).toHaveAttribute("aria-pressed", "false");
    await user.click(row);

    expect(row).toHaveAttribute("aria-pressed", "true");
    expect(play).not.toHaveBeenCalled();
  });
});
