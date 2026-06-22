import { render, screen, userEvent, waitFor } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks } from "../../../__tests__/factories";
import { Toolbar } from "../Toolbar";

const { replace, searchParamsRef, itemsRef, toolbarMenuSpy } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
  itemsRef: { current: [] as ReturnType<typeof makeRequestWithTracks>[] },
  toolbarMenuSpy: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/requests",
  useSearchParams: () => searchParamsRef.current,
}));

vi.mock("@hooks/api", () => ({
  useTrackRequests: () => ({ data: itemsRef.current }),
}));

vi.mock("../FilterSortMenu", () => ({
  FilterSortMenu: () => <div>filter sort</div>,
}));

vi.mock("../ImportProviderMenu", () => ({
  ImportProviderMenu: () => <div>import provider</div>,
}));

vi.mock("../RequestsToolbarMenu", () => ({
  RequestsToolbarMenu: ({ hasItems }: { hasItems: boolean }) => {
    toolbarMenuSpy(hasItems);
    return <div>toolbar menu</div>;
  },
}));

describe("Toolbar", () => {
  beforeEach(() => {
    searchParamsRef.current = new URLSearchParams();
    itemsRef.current = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("composes the filter, search, import and overflow controls", () => {
    render(<Toolbar />);

    expect(screen.getByText("filter sort")).toBeInTheDocument();
    expect(screen.getByText("import provider")).toBeInTheDocument();
    expect(screen.getByText("toolbar menu")).toBeInTheDocument();
  });

  it("passes hasItems=false to the overflow menu when there are no requests", () => {
    render(<Toolbar />);

    expect(toolbarMenuSpy).toHaveBeenCalledWith(false);
  });

  it("passes hasItems=true to the overflow menu when requests exist", () => {
    itemsRef.current = [makeRequestWithTracks()];
    render(<Toolbar />);

    expect(toolbarMenuSpy).toHaveBeenCalledWith(true);
  });

  it("writes the debounced search query into the url", async () => {
    const user = userEvent.setup();
    render(<Toolbar />);

    await user.type(screen.getByPlaceholderText("Filter..."), "daft");

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/requests?q=daft", { scroll: false });
    });
  });
});
