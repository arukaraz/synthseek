import { render, screen, userEvent } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FilterSortMenu } from "../FilterSortMenu";

const { replace, searchParamsRef } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/requests",
  useSearchParams: () => searchParamsRef.current,
}));

describe("FilterSortMenu", () => {
  beforeEach(() => {
    searchParamsRef.current = new URLSearchParams();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders every status filter and sort option in the dropdown", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("menuitemradio", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Waiting for Approval" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Failed" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Recent" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Artist" })).toBeInTheDocument();
  });

  it("writes the pending approval status filter to the url", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("menuitemradio", { name: "Waiting for Approval" }));

    expect(replace).toHaveBeenCalledWith("/requests?filter=pending_approval", { scroll: false });
  });

  it("writes the selected status filter to the url", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("menuitemradio", { name: "Failed" }));

    expect(replace).toHaveBeenCalledWith("/requests?filter=failed", { scroll: false });
  });

  it("writes the selected sort field to the url", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("menuitemradio", { name: "Artist" }));

    expect(replace).toHaveBeenCalledWith("/requests?sort=artist", { scroll: false });
  });

  it("writes the ascending sort direction from the order control", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button", { name: "Filter and sort" }));
    await user.click(screen.getByRole("button", { name: "Ascending" }));

    expect(replace).toHaveBeenCalledWith("/requests?dir=asc", { scroll: false });
  });

  it("reflects the active filter coming from the url params in the trigger label", () => {
    searchParamsRef.current = new URLSearchParams({ filter: "active" });
    render(<FilterSortMenu />);

    expect(screen.getByText("Active · Recent")).toBeInTheDocument();
  });
});
