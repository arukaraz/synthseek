import { render, screen, userEvent, waitFor } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks } from "../../__tests__/factories";
import { GroupsViewMode } from "../GroupsViewMode";

const { replace, searchParamsRef, queryState, detailSpy } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
  queryState: {
    data: undefined as ReturnType<typeof makeRequestWithTracks>[] | undefined,
    isLoading: false,
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
      makeRequestWithTracks({ id: "a", external_id: "ext-a", name: "First" }),
      makeRequestWithTracks({ id: "b", external_id: "ext-b", name: "Second" }),
    ];
    render(<GroupsViewMode />);

    expect(screen.getAllByTestId("sidebar-request-item")).toHaveLength(2);
  });

  it("selects a request by its external id when a sidebar row is clicked", async () => {
    const user = userEvent.setup();
    queryState.data = [makeRequestWithTracks({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    await user.click(screen.getByTestId("sidebar-request-item"));

    expect(replace).toHaveBeenCalledWith("/requests?selected=ext-a", { scroll: false });
  });

  it("passes the request matching the selected url param down to the detail pane", () => {
    searchParamsRef.current = new URLSearchParams({ selected: "ext-b" });
    queryState.data = [
      makeRequestWithTracks({ id: "a", external_id: "ext-a" }),
      makeRequestWithTracks({ id: "b", external_id: "ext-b" }),
    ];
    render(<GroupsViewMode />);

    expect(screen.getByText("detail: b")).toBeInTheDocument();
  });

  it("passes a null request to the detail pane when nothing is selected on mobile", () => {
    queryState.data = [makeRequestWithTracks({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    expect(detailSpy).toHaveBeenCalledWith(null);
    expect(replace).not.toHaveBeenCalled();
  });

  it("auto-selects the first request on desktop when none is selected", async () => {
    setMatchMedia(true);
    queryState.data = [makeRequestWithTracks({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/requests?selected=ext-a", { scroll: false });
    });
  });

  it("clears the selected url param when the detail pane requests a back action", async () => {
    const user = userEvent.setup();
    searchParamsRef.current = new URLSearchParams({ selected: "ext-a" });
    queryState.data = [makeRequestWithTracks({ id: "a", external_id: "ext-a" })];
    render(<GroupsViewMode />);

    await user.click(screen.getByRole("button", { name: "back" }));

    expect(replace).toHaveBeenCalledWith("/requests", { scroll: false });
  });
});
