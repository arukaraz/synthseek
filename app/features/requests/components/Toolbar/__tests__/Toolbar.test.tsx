import { render, screen, userEvent, waitFor } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Toolbar } from "../Toolbar";

const { replace, searchParamsRef, totalRef, toolbarMenuSpy } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
  totalRef: { current: 0 },
  toolbarMenuSpy: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/requests",
  useSearchParams: () => searchParamsRef.current,
}));

vi.mock("@hooks/api", () => ({
  useRequestSummary: () => ({ data: { total: totalRef.current, downloading: false } }),
}));

vi.mock("../FilterSortMenu", () => ({
  FilterSortMenu: () => <div>filter sort</div>,
}));

vi.mock("../ReviewQueueButton", () => ({
  ReviewQueueButton: () => <div>review queue</div>,
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
    totalRef.current = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("composes the filter, search, review and overflow controls", () => {
    render(<Toolbar />);

    expect(screen.getByText("filter sort")).toBeInTheDocument();
    expect(screen.getByText("review queue")).toBeInTheDocument();
    expect(screen.getByText("toolbar menu")).toBeInTheDocument();
  });

  it("passes hasItems=false to the overflow menu when there are no requests", () => {
    render(<Toolbar />);

    expect(toolbarMenuSpy).toHaveBeenCalledWith(false);
  });

  it("passes hasItems=true to the overflow menu when requests exist", () => {
    totalRef.current = 1;
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
