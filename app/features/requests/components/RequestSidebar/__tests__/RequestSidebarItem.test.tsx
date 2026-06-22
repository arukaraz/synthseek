import { ContentType, RequestStatus } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks, makeRequestsUser } from "../../../__tests__/factories";
import { RequestSidebarItem } from "../RequestSidebarItem";

describe("RequestSidebarItem", () => {
  it("renders the name, artist, completed ratio and requester", () => {
    const request = makeRequestWithTracks({
      name: "Summer Mix",
      artist: "Various",
      completed_tracks: 4,
      total_tracks: 12,
      requestedBy: makeRequestsUser({ username: "dj" }),
    });

    render(<RequestSidebarItem request={request} isSelected={false} onSelect={() => {}} />);

    expect(screen.getByText("Summer Mix")).toBeInTheDocument();
    expect(screen.getByText("Various")).toBeInTheDocument();
    expect(screen.getByText("4/12")).toBeInTheDocument();
    expect(screen.getByText(/dj/)).toBeInTheDocument();
  });

  it("marks the item active when selected", () => {
    render(<RequestSidebarItem request={makeRequestWithTracks()} isSelected onSelect={() => {}} />);

    expect(screen.getByTestId("sidebar-request-item")).toHaveAttribute("data-active", "true");
  });

  it("does not set the active attribute when unselected", () => {
    render(<RequestSidebarItem request={makeRequestWithTracks()} isSelected={false} onSelect={() => {}} />);

    expect(screen.getByTestId("sidebar-request-item")).not.toHaveAttribute("data-active");
  });

  it("exposes the request status through a data attribute", () => {
    render(
      <RequestSidebarItem
        request={makeRequestWithTracks({ status: RequestStatus.enum.complete })}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByTestId("sidebar-request-item")).toHaveAttribute("data-status", "complete");
  });

  it("renders the uppercased content-type label for an album", () => {
    render(
      <RequestSidebarItem
        request={makeRequestWithTracks({ contentType: ContentType.enum.album })}
        isSelected={false}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText(/ALBUM/)).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<RequestSidebarItem request={makeRequestWithTracks()} isSelected={false} onSelect={onSelect} />);

    await user.click(screen.getByTestId("sidebar-request-item"));

    expect(onSelect).toHaveBeenCalledOnce();
  });
});
