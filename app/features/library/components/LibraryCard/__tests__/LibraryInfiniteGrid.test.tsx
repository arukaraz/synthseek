import { describe, it, expect, vi } from "vitest";

import { render, screen } from "@test/test-utils";

const sentinelRef = vi.hoisted(() => ({ current: null }));
const useInfiniteScrollMock = vi.hoisted(() => vi.fn(() => sentinelRef));

vi.mock("../../../hooks/useInfiniteScroll", () => ({
  useInfiniteScroll: useInfiniteScrollMock,
}));

import { LibraryInfiniteGrid } from "../LibraryInfiniteGrid";

interface Item {
  id: string;
  name: string;
}

function makeProps(overrides?: Partial<Parameters<typeof LibraryInfiniteGrid<Item>>[0]>) {
  return {
    items: [
      { id: "1", name: "Alpha" },
      { id: "2", name: "Beta" },
    ],
    ariaLabel: "Albums",
    renderCard: (item: Item) => <li key={item.id}>{item.name}</li>,
    getCardId: (item: Item) => item.id,
    scrollRoot: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    ...overrides,
  };
}

describe("LibraryInfiniteGrid", () => {
  it("renders one card per item via renderCard", () => {
    render(<LibraryInfiniteGrid {...makeProps()} />);

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("forwards the paging state to the infinite-scroll hook", () => {
    const fetchNextPage = vi.fn();
    render(<LibraryInfiniteGrid {...makeProps({ hasNextPage: true, fetchNextPage })} />);

    expect(useInfiniteScrollMock).toHaveBeenCalledWith(
      expect.objectContaining({ hasNextPage: true, isFetchingNextPage: false, onLoadMore: fetchNextPage })
    );
  });

  it("renders a loading spinner while the next page is fetching", () => {
    render(<LibraryInfiniteGrid {...makeProps({ isFetchingNextPage: true })} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("does not render a spinner when not fetching", () => {
    render(<LibraryInfiniteGrid {...makeProps({ isFetchingNextPage: false })} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
