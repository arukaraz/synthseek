import { render, screen, userEvent } from "@test/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks } from "../../../__tests__/factories";
import { RequestSidebar } from "../RequestSidebar";
import type { RequestSidebarProps } from "../types";

const observed: { callback: IntersectionObserverCallback; element: Element }[] = [];

class RecordingIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(element: Element) {
    observed.push({ callback: this.callback, element });
  }
  unobserve() {}
  disconnect() {}
}

function intersect(index: number): void {
  const { callback, element } = observed[index];
  const entry = { isIntersecting: true, target: element };
  callback([entry as unknown as IntersectionObserverEntry], {} as unknown as IntersectionObserver);
}

function props(overrides: Partial<RequestSidebarProps>): RequestSidebarProps {
  return {
    items: [],
    selectedId: null,
    onSelect: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
    onLoadNext: () => {},
    hasPreviousPage: false,
    isFetchingPreviousPage: false,
    onLoadPrevious: () => {},
    ...overrides,
  };
}

describe("RequestSidebar", () => {
  beforeEach(() => {
    observed.length = 0;
    vi.stubGlobal("IntersectionObserver", RecordingIntersectionObserver);
  });

  it("renders the empty state when there are no items", () => {
    render(<RequestSidebar {...props({})} />);

    expect(screen.getByText("No Requests")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-request-item")).not.toBeInTheDocument();
  });

  it("forwards the search query to the empty state when no items match", () => {
    render(<RequestSidebar {...props({ searchQuery: "phantom" })} />);

    expect(screen.getByText("No Results")).toBeInTheDocument();
    expect(screen.getByText(/phantom/)).toBeInTheDocument();
  });

  it("renders one row per item", () => {
    const items = [
      makeRequestWithTracks({ id: "a", external_id: "ext-a", name: "First" }),
      makeRequestWithTracks({ id: "b", external_id: "ext-b", name: "Second" }),
    ];

    render(<RequestSidebar {...props({ items })} />);

    expect(screen.getAllByTestId("sidebar-request-item")).toHaveLength(2);
  });

  it("asks for the next page when the end of the list comes into view, and only while one exists", () => {
    const onLoadNext = vi.fn();
    const items = [makeRequestWithTracks({ id: "a", external_id: "ext-a" })];

    const { rerender } = render(<RequestSidebar {...props({ items, onLoadNext, hasNextPage: false })} />);
    expect(observed).toHaveLength(0);

    rerender(<RequestSidebar {...props({ items, onLoadNext, hasNextPage: true })} />);
    intersect(observed.length - 1);

    expect(onLoadNext).toHaveBeenCalledTimes(1);
  });

  it("asks for the previous page when earlier pages were dropped and the top comes into view", () => {
    const onLoadPrevious = vi.fn();
    const onLoadNext = vi.fn();
    const items = [makeRequestWithTracks({ id: "a", external_id: "ext-a" })];

    render(<RequestSidebar {...props({ items, onLoadPrevious, onLoadNext, hasPreviousPage: true })} />);
    intersect(observed.length - 1);

    expect(onLoadPrevious).toHaveBeenCalledTimes(1);
    expect(onLoadNext).not.toHaveBeenCalled();
  });

  it("calls onSelect with the item id when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const items = [makeRequestWithTracks({ id: "abc", external_id: "ext-abc" })];

    render(<RequestSidebar {...props({ items, onSelect })} />);
    await user.click(screen.getByTestId("sidebar-request-item"));

    expect(onSelect).toHaveBeenCalledWith("abc");
  });
});
