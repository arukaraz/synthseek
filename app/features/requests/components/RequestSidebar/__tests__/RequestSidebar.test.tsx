import { render, screen, userEvent } from "@test/test-utils";
import { RENDER_WINDOW_STEP } from "@hooks/ui/constants";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks } from "../../../__tests__/factories";
import { RequestSidebar } from "../RequestSidebar";

class StubIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("RequestSidebar", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", StubIntersectionObserver);
  });

  it("renders the empty state when there are no items", () => {
    render(<RequestSidebar items={[]} selectedId={null} onSelect={() => {}} windowKey="all" />);

    expect(screen.getByText("No Requests")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-request-item")).not.toBeInTheDocument();
  });

  it("forwards the search query to the empty state when no items match", () => {
    render(<RequestSidebar items={[]} selectedId={null} onSelect={() => {}} searchQuery="phantom" windowKey="all" />);

    expect(screen.getByText("No Results")).toBeInTheDocument();
    expect(screen.getByText(/phantom/)).toBeInTheDocument();
  });

  it("renders one row per item", () => {
    const items = [
      makeRequestWithTracks({ id: "a", external_id: "ext-a", name: "First" }),
      makeRequestWithTracks({ id: "b", external_id: "ext-b", name: "Second" }),
    ];

    render(<RequestSidebar items={items} selectedId={null} onSelect={() => {}} windowKey="all" />);

    expect(screen.getAllByTestId("sidebar-request-item")).toHaveLength(2);
  });

  it("renders only the first window of a long list, so a large request history does not mount at once", () => {
    const items = Array.from({ length: RENDER_WINDOW_STEP + 25 }, (_, index) =>
      makeRequestWithTracks({ id: `id-${index}`, external_id: `ext-${index}`, name: `Item ${index}` })
    );

    render(<RequestSidebar items={items} selectedId={null} onSelect={() => {}} windowKey="all" />);

    expect(screen.getAllByTestId("sidebar-request-item")).toHaveLength(RENDER_WINDOW_STEP);
  });

  it("calls onSelect with the item id when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const items = [makeRequestWithTracks({ id: "abc", external_id: "ext-abc" })];

    render(<RequestSidebar items={items} selectedId={null} onSelect={onSelect} windowKey="all" />);
    await user.click(screen.getByTestId("sidebar-request-item"));

    expect(onSelect).toHaveBeenCalledWith("abc");
  });
});
