import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import type { TracksViewModeProps } from "../../types";

import { TracksViewMode } from "../TracksViewMode";

const useLibraryTracksMock = vi.hoisted(() => vi.fn());
const prefetchNextPageMock = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api", () => ({
  useLibraryTracks: useLibraryTracksMock,
  useLibraryTracksPrefetch: () => ({ prefetchNextPage: prefetchNextPageMock }),
}));

interface CapturedLayout {
  total: number;
  isLoading: boolean;
  isError: boolean;
  content: { layout: string; getRowId?: (item: LibraryTrackItem) => string };
}

const captured: { props?: CapturedLayout } = {};

vi.mock("../LibraryViewLayout/LibraryViewLayout", () => ({
  LibraryViewLayout: (props: CapturedLayout) => {
    captured.props = props;
    return <div data-testid="layout">layout:{props.content.layout}</div>;
  },
}));

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
    duration_ms: 212000,
    track_number: 3,
    disc_number: 1,
    explicit: false,
    album_id: "alb-1",
    albumName: "Discovery",
    albumArt: null,
    genres: ["electronic"],
    playlistIds: [],
    created_at: new Date("2024-01-01T00:00:00.000Z"),
    completed_at: null,
  };
}

function makeProps(overrides?: Partial<TracksViewModeProps["controller"]>): TracksViewModeProps {
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
    filtersOpen: false,
    onFiltersOpenChange: vi.fn(),
    selection: {} as unknown as TracksViewModeProps["selection"],
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
    renderWithProviders(<TracksViewMode {...makeProps()} />);

    expect(screen.getByTestId("layout")).toHaveTextContent("layout:table");
    expect(useLibraryTracksMock).toHaveBeenCalledWith(expect.anything(), true);
  });

  it("does not prefetch when the current page is the last page", () => {
    renderWithProviders(<TracksViewMode {...makeProps()} />);

    expect(prefetchNextPageMock).not.toHaveBeenCalled();
  });

  it("prefetches the next page when more results remain", () => {
    useLibraryTracksMock.mockReturnValue({
      data: { items: [createTrack()], total: 120, facets: {} },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<TracksViewMode {...makeProps()} />);

    expect(prefetchNextPageMock).toHaveBeenCalledTimes(1);
    expect(prefetchNextPageMock).toHaveBeenCalledWith(expect.anything(), 50);
  });

  it("forwards the total and loading state to the layout", () => {
    renderWithProviders(<TracksViewMode {...makeProps()} />);

    expect(captured.props?.total).toBe(1);
    expect(captured.props?.isLoading).toBe(false);
    expect(captured.props?.isError).toBe(false);
  });

  it("derives a table row id from the track id", () => {
    renderWithProviders(<TracksViewMode {...makeProps()} />);

    expect(captured.props?.content.getRowId?.(createTrack())).toBe("trk-1");
  });
});
