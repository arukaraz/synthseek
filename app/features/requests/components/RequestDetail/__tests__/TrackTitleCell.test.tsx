import { RequestStatus } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import { TrackTitleCell } from "../TrackTitleCell";

vi.mock("@hooks/api/queries/useActiveReleases", () => ({
  useTrackRelease: () => null,
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: false, currentUser: { id: "user-1" } }),
}));

function renderCell(overrides: Parameters<typeof makeRequestsTrack>[0] = {}, expanded = false) {
  const onToggle = vi.fn();
  render(<TrackTitleCell track={makeRequestsTrack(overrides)} expanded={expanded} onToggle={onToggle} />);
  return { onToggle };
}

describe("TrackTitleCell", () => {
  it("names the track and its artist inside the button that opens its details", () => {
    renderCell({ title: "Midnight City", credited_artist: "M83" });

    const toggle = screen.getByRole("button", { name: /^Midnight City.*M83/ });
    expect(toggle).not.toHaveAttribute("aria-label");
    expect(toggle).toHaveTextContent("Midnight City");
    expect(toggle).toHaveTextContent("M83");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("offers to hide the details once they are open", () => {
    renderCell({ title: "Midnight City" }, true);

    const toggle = screen.getByRole("button", { name: /^Midnight City/ });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onToggle when the title is clicked", async () => {
    const { onToggle } = renderCell();

    await userEvent.click(screen.getByRole("button", { name: /^A Song/ }));

    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("marks an explicit track", () => {
    renderCell({ explicit: true });

    expect(screen.getByTitle("Explicit")).toHaveTextContent("E");
  });

  it("marks nothing on a clean track", () => {
    renderCell({ explicit: false });

    expect(screen.queryByTitle("Explicit")).not.toBeInTheDocument();
  });

  it("dims the title for a complete track", () => {
    renderCell({ status: RequestStatus.enum.complete });

    expect(screen.getByText("A Song").parentElement).toHaveClass("text-fg/80");
  });

  it("further dims the title for a failed or cancelled track", () => {
    renderCell({ status: RequestStatus.enum.cancelled });

    expect(screen.getByText("A Song").parentElement).toHaveClass("text-fg/50");
  });

  it("uses the default emphasis for a queued track", () => {
    renderCell({ status: RequestStatus.enum.queued });

    expect(screen.getByText("A Song").parentElement).toHaveClass("text-fg/90");
  });

  it("carries the status inline for the narrow layout", () => {
    renderCell({ status: RequestStatus.enum.failed });

    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
