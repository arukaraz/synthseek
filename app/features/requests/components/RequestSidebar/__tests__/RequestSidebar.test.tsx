import { render, screen, userEvent } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks } from "../../../__tests__/factories";
import { RequestSidebar } from "../RequestSidebar";

describe("RequestSidebar", () => {
  it("renders the empty state when there are no items", () => {
    render(<RequestSidebar items={[]} selectedId={null} onSelect={() => {}} />);

    expect(screen.getByText("No Requests")).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-request-item")).not.toBeInTheDocument();
  });

  it("forwards the search query to the empty state when no items match", () => {
    render(<RequestSidebar items={[]} selectedId={null} onSelect={() => {}} searchQuery="phantom" />);

    expect(screen.getByText("No Results")).toBeInTheDocument();
    expect(screen.getByText(/phantom/)).toBeInTheDocument();
  });

  it("renders one row per item", () => {
    const items = [
      makeRequestWithTracks({ id: "a", external_id: "ext-a", name: "First" }),
      makeRequestWithTracks({ id: "b", external_id: "ext-b", name: "Second" }),
    ];

    render(<RequestSidebar items={items} selectedId={null} onSelect={() => {}} />);

    expect(screen.getAllByTestId("sidebar-request-item")).toHaveLength(2);
  });

  it("calls onSelect with the item id when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const items = [makeRequestWithTracks({ id: "abc", external_id: "ext-abc" })];

    render(<RequestSidebar items={items} selectedId={null} onSelect={onSelect} />);
    await user.click(screen.getByTestId("sidebar-request-item"));

    expect(onSelect).toHaveBeenCalledWith("abc");
  });
});
