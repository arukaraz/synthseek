import { RequestStatus } from "@api/__generated__/types";
import { render, screen, userEvent, waitFor } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestListItem } from "../../__tests__/factories";
import { GroupsViewMode } from "../GroupsViewMode";

const { replace, searchParamsRef, queryState, detailSpy } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
  queryState: {
    data: undefined as ReturnType<typeof makeRequestListItem>[] | undefined,
    isLoading: false,
    trackTitleMatchIds: undefined as string[] | undefined,
    sourceMatchIds: undefined as string[] | undefined,
    askedSource: [] as Array<string | null>,
  },
  detailSpy: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/requests",
  useSearchParams: () => searchParamsRef.current,
}));

vi.mock("@hooks/api", () => ({
  useTrackRequests: () => ({ data: queryState.data, isLoading: queryState.isLoading }),
  useTrackTitleMatches: () => ({ data: queryState.trackTitleMatchIds }),
  useRequestIdsBySource: (source: string | null) => {
    queryState.askedSource.push(source);
    return { data: source === null ? undefined : queryState.sourceMatchIds };
  },
}));

vi.mock("../RequestDetail/RequestDetail", () => ({
  RequestDetail: (props: { request: { id: string } | null; onBack: () => void }) => {
    detailSpy(props.request);
    return (
      <div>
        detail: {props.request ? props.request.id : "none"}
        <button type="button" onClick={props.onBack}>
          back
        </button>
      </div>
    );
  },
}));

function setMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("GroupsViewMode", () => {
  beforeEach(() => {
    replace.mockClear();
    detailSpy.mockClear();
    searchParamsRef.current = new URLSearchParams();
    queryState.data = undefined;
    queryState.isLoading = false;
    queryState.trackTitleMatchIds = undefined;
    queryState.sourceMatchIds = undefined;
    queryState.askedSource = [];
    setMatchMedia(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows the loading state while requests are fetching", () => {
    queryState.isLoading = true;
    render(<GroupsViewMode />);

    expect(screen.getByText("Loading requests...")).toBeInTheDocument();
  });

  it("renders a sidebar row per request once loaded", () => {
    queryState.data = [
      makeRequestListItem({ id: "a", external_id: "ext-a", name: "First" }),
      makeRequestListItem({ id: "b", external_id: "ext-b", name: "Second" }),
    ];
    render(<GroupsViewMode />);

    expect(screen.getAllByTestId("sidebar-request-item")).toHaveLength(2);
  });

  it("keeps a request the server matched only on a TRACK title, which the client filter cannot see", () => {
    searchParamsRef.current = new URLSearchParams("q=hidden");
    queryState.data = [
      makeRequestListItem({ id: "a", external_id: "ext-a", name: "Album One", credited_artist: "Artist" }),
      makeRequestListItem({ id: "b", external_id: "ext-b", name: "Album Two", credited_artist: "Artist" }),
    ];
    queryState.trackTitleMatchIds = ["b"];

    render(<GroupsViewMode />);

    const rows = screen.getAllByTestId("sidebar-request-item");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Album Two");
  });

  it("shows only the requests the server reports for the source in the url, and asks for no source by default", () => {
    queryState.data = [
      makeRequestListItem({ id: "a", external_id: "ext-a", name: "From Torrent" }),
      makeRequestListItem({ id: "b", external_id: "ext-b", name: "From Slskd" }),
    ];
    queryState.sourceMatchIds = ["a"];

    const { unmount } = render(<GroupsViewMode />);
    expect(screen.getAllByTestId("sidebar-request-item")).toHaveLength(2);
    expect(queryState.askedSource.at(-1)).toBeNull();
    unmount();

    searchParamsRef.current = new URLSearchParams("source=torrent");
    render(<GroupsViewMode />);

    const rows = screen.getAllByTestId("sidebar-request-item");
    expect(queryState.askedSource.at(-1)).toBe("torrent");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("From Torrent");
  });

  it("shows nothing for a chosen source until the server answers", () => {
    searchParamsRef.current = new URLSearchParams("source=archive");
    queryState.data = [makeRequestListItem({ id: "a", external_id: "ext-a" })];

    render(<GroupsViewMode />);

    expect(screen.queryAllByTestId("sidebar-request-item")).toHaveLength(0);
    expect(screen.queryByText("Nothing from Internet Archive yet")).not.toBeInTheDocument();
  });

  it("says a chosen source has nothing yet once the server answers with no request", () => {
    searchParamsRef.current = new URLSearchParams("source=slskd");
    queryState.data = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    queryState.sourceMatchIds = [];

    render(<GroupsViewMode />);

    expect(screen.getByText("Nothing from Slskd yet")).toBeInTheDocument();
  });

  it("blames the status filter, not the source, when the source has requests the status hides", () => {
    searchParamsRef.current = new URLSearchParams("source=archive&filter=failed");
    queryState.data = [makeRequestListItem({ id: "a", external_id: "ext-a", status: RequestStatus.enum.complete })];
    queryState.sourceMatchIds = ["a"];

    render(<GroupsViewMode />);

    expect(screen.getByText("No matching requests")).toBeInTheDocument();
  });

  it("drops every request when the server reports no track-title match either", () => {
    searchParamsRef.current = new URLSearchParams("q=hidden");
    queryState.data = [
      makeRequestListItem({ id: "a", external_id: "ext-a", name: "Album One", credited_artist: "Artist" }),
    ];
    queryState.trackTitleMatchIds = [];

    render(<GroupsViewMode />);

    expect(screen.queryAllByTestId("sidebar-request-item")).toHaveLength(0);
  });

  it("selects a request by its external id when a sidebar row is clicked", async () => {
    const user = userEvent.setup();
    queryState.data = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    await user.click(screen.getByTestId("sidebar-request-item"));

    expect(replace).toHaveBeenCalledWith("/requests?selected=ext-a", { scroll: false });
  });

  it("passes the request matching the selected url param down to the detail pane", () => {
    searchParamsRef.current = new URLSearchParams({ selected: "ext-b" });
    queryState.data = [
      makeRequestListItem({ id: "a", external_id: "ext-a" }),
      makeRequestListItem({ id: "b", external_id: "ext-b" }),
    ];
    render(<GroupsViewMode />);

    expect(screen.getByText("detail: b")).toBeInTheDocument();
  });

  it("passes a null request to the detail pane when nothing is selected on mobile", () => {
    queryState.data = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    expect(detailSpy).toHaveBeenCalledWith(null);
    expect(replace).not.toHaveBeenCalled();
  });

  it("auto-selects the first request on desktop when none is selected", async () => {
    setMatchMedia(true);
    queryState.data = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/requests?selected=ext-a", { scroll: false });
    });
  });

  it("moves the selection to the first visible request on desktop when a filter hides the selected one", async () => {
    setMatchMedia(true);
    searchParamsRef.current = new URLSearchParams({ selected: "ext-done", filter: "failed" });
    queryState.data = [
      makeRequestListItem({ id: "done", external_id: "ext-done", status: RequestStatus.enum.complete }),
      makeRequestListItem({ id: "failed", external_id: "ext-failed", status: RequestStatus.enum.failed }),
    ];
    render(<GroupsViewMode />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/requests?selected=ext-failed&filter=failed", { scroll: false });
    });
  });

  it("keeps a selection the filter still shows", () => {
    setMatchMedia(true);
    searchParamsRef.current = new URLSearchParams({ selected: "ext-b" });
    queryState.data = [
      makeRequestListItem({ id: "a", external_id: "ext-a" }),
      makeRequestListItem({ id: "b", external_id: "ext-b" }),
    ];
    render(<GroupsViewMode />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("clears the selected url param when the detail pane requests a back action", async () => {
    const user = userEvent.setup();
    searchParamsRef.current = new URLSearchParams({ selected: "ext-a" });
    queryState.data = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    await user.click(screen.getByRole("button", { name: "back" }));

    expect(replace).toHaveBeenCalledWith("/requests", { scroll: false });
  });
});
