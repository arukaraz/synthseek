import { render, screen, userEvent, waitFor } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestListItem } from "../../__tests__/factories";
import { GroupsViewMode } from "../GroupsViewMode";

type Item = ReturnType<typeof makeRequestListItem>;

interface AskedList {
  input: Record<string, unknown>;
  enabled: boolean;
}

const { replace, searchParamsRef, listState, detailSpy } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
  listState: {
    items: [] as Item[],
    isLoading: false,
    lookup: [] as Item[],
    lookupLoading: false,
    asked: [] as AskedList[],
  },
  detailSpy: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/requests",
  useSearchParams: () => searchParamsRef.current,
}));

vi.mock("@hooks/api", () => ({
  useHoldRequestListRows: vi.fn(),
  useRequestList: (input: Record<string, unknown>, enabled: boolean = true) => {
    listState.asked.push({ input, enabled });
    const isLookup = Object.hasOwn(input, "externalId");
    const items = isLookup ? (enabled ? listState.lookup : []) : listState.items;
    return {
      items,
      total: items.length,
      isLoading: isLookup ? enabled && listState.lookupLoading : listState.isLoading,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      hasPreviousPage: false,
      isFetchingPreviousPage: false,
      fetchPreviousPage: vi.fn(),
    };
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

function lastMainInput(): Record<string, unknown> | undefined {
  return listState.asked.filter((call) => !Object.hasOwn(call.input, "externalId")).at(-1)?.input;
}

function lastLookup(): AskedList | undefined {
  return listState.asked.filter((call) => Object.hasOwn(call.input, "externalId")).at(-1);
}

describe("GroupsViewMode", () => {
  beforeEach(() => {
    replace.mockClear();
    detailSpy.mockClear();
    searchParamsRef.current = new URLSearchParams();
    listState.items = [];
    listState.isLoading = false;
    listState.lookup = [];
    listState.lookupLoading = false;
    listState.asked = [];
    setMatchMedia(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows the loading state while requests are fetching", () => {
    listState.isLoading = true;
    render(<GroupsViewMode />);

    expect(screen.getByText("Loading requests...")).toBeInTheDocument();
  });

  it("renders a sidebar row per request the server returned", () => {
    listState.items = [
      makeRequestListItem({ id: "a", external_id: "ext-a", name: "First" }),
      makeRequestListItem({ id: "b", external_id: "ext-b", name: "Second" }),
    ];
    render(<GroupsViewMode />);

    expect(screen.getAllByTestId("sidebar-request-item")).toHaveLength(2);
  });

  it("asks the server for everything, newest first, when the url sets nothing", () => {
    render(<GroupsViewMode />);

    expect(lastMainInput()).toEqual({ filter: "all", source: null, q: "", sort: "recent", direction: "desc" });
  });

  it("hands the status, source, search and order in the url to the server", () => {
    searchParamsRef.current = new URLSearchParams("filter=failed&source=torrent&q=hidden&sort=artist&dir=asc");
    render(<GroupsViewMode />);

    expect(lastMainInput()).toEqual({
      filter: "failed",
      source: "torrent",
      q: "hidden",
      sort: "artist",
      direction: "asc",
    });
  });

  it("says a chosen source has nothing yet when the server returns no request for it", () => {
    searchParamsRef.current = new URLSearchParams("source=slskd");
    render(<GroupsViewMode />);

    expect(screen.getByText("Nothing from Slskd yet")).toBeInTheDocument();
  });

  it("blames the status filter, not the source, when a status filter is also set", () => {
    searchParamsRef.current = new URLSearchParams("source=archive&filter=failed");
    render(<GroupsViewMode />);

    expect(screen.getByText("No matching requests")).toBeInTheDocument();
  });

  it("shows the no-results state when the server matches nothing for a search", () => {
    searchParamsRef.current = new URLSearchParams("q=hidden");
    render(<GroupsViewMode />);

    expect(screen.queryAllByTestId("sidebar-request-item")).toHaveLength(0);
    expect(screen.getByText("No Results")).toBeInTheDocument();
  });

  it("selects a request by its external id when a sidebar row is clicked", async () => {
    const user = userEvent.setup();
    listState.items = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    await user.click(screen.getByTestId("sidebar-request-item"));

    expect(replace).toHaveBeenCalledWith("/requests?selected=ext-a", { scroll: false });
  });

  it("passes the loaded request matching the selected url param down to the detail pane, without a lookup", () => {
    searchParamsRef.current = new URLSearchParams({ selected: "ext-b" });
    listState.items = [
      makeRequestListItem({ id: "a", external_id: "ext-a" }),
      makeRequestListItem({ id: "b", external_id: "ext-b" }),
    ];
    render(<GroupsViewMode />);

    expect(screen.getByText("detail: b")).toBeInTheDocument();
    expect(lastLookup()?.enabled).toBe(false);
  });

  it("looks up a selected request beyond the loaded pages under the same filters, and keeps it selected", () => {
    setMatchMedia(true);
    searchParamsRef.current = new URLSearchParams({ selected: "ext-deep", filter: "done" });
    listState.items = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    listState.lookup = [makeRequestListItem({ id: "deep", external_id: "ext-deep" })];
    render(<GroupsViewMode />);

    expect(lastLookup()).toEqual({
      input: { filter: "done", source: null, q: "", sort: "recent", direction: "desc", externalId: "ext-deep" },
      enabled: true,
    });
    expect(screen.getByText("detail: deep")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("does not move the selection while the lookup of a deep-linked request is still running", () => {
    setMatchMedia(true);
    searchParamsRef.current = new URLSearchParams({ selected: "ext-deep" });
    listState.items = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    listState.lookupLoading = true;
    render(<GroupsViewMode />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("keeps showing the open request while it is looked up again after a refresh dropped its page", () => {
    searchParamsRef.current = new URLSearchParams({ selected: "ext-b" });
    listState.items = [
      makeRequestListItem({ id: "a", external_id: "ext-a" }),
      makeRequestListItem({ id: "b", external_id: "ext-b" }),
    ];
    const { rerender } = render(<GroupsViewMode />);
    expect(screen.getByText("detail: b")).toBeInTheDocument();

    listState.items = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    listState.lookupLoading = true;
    rerender(<GroupsViewMode />);

    expect(screen.getByText("detail: b")).toBeInTheDocument();
    expect(detailSpy).not.toHaveBeenCalledWith(null);
  });

  it("lets go of the open request once the lookup finds it gone", () => {
    searchParamsRef.current = new URLSearchParams({ selected: "ext-b" });
    listState.items = [makeRequestListItem({ id: "b", external_id: "ext-b" })];
    const { rerender } = render(<GroupsViewMode />);

    listState.items = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    listState.lookup = [];
    rerender(<GroupsViewMode />);

    expect(screen.getByText("detail: none")).toBeInTheDocument();
  });

  it("passes a null request to the detail pane when nothing is selected on mobile", () => {
    listState.items = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    expect(detailSpy).toHaveBeenCalledWith(null);
    expect(lastLookup()).toMatchObject({ input: { externalId: null }, enabled: false });
    expect(replace).not.toHaveBeenCalled();
  });

  it("auto-selects the first request on desktop when none is selected", async () => {
    setMatchMedia(true);
    listState.items = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/requests?selected=ext-a", { scroll: false });
    });
  });

  it("moves the selection to the first visible request on desktop when the filter excludes the selected one", async () => {
    setMatchMedia(true);
    searchParamsRef.current = new URLSearchParams({ selected: "ext-done", filter: "failed" });
    listState.items = [makeRequestListItem({ id: "failed", external_id: "ext-failed" })];
    listState.lookup = [];
    render(<GroupsViewMode />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/requests?selected=ext-failed&filter=failed", { scroll: false });
    });
  });

  it("keeps a selection the filter still shows", () => {
    setMatchMedia(true);
    searchParamsRef.current = new URLSearchParams({ selected: "ext-b" });
    listState.items = [
      makeRequestListItem({ id: "a", external_id: "ext-a" }),
      makeRequestListItem({ id: "b", external_id: "ext-b" }),
    ];
    render(<GroupsViewMode />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("clears the selected url param when the detail pane requests a back action", async () => {
    const user = userEvent.setup();
    searchParamsRef.current = new URLSearchParams({ selected: "ext-a" });
    listState.items = [makeRequestListItem({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    await user.click(screen.getByRole("button", { name: "back" }));

    expect(replace).toHaveBeenCalledWith("/requests", { scroll: false });
  });
});
