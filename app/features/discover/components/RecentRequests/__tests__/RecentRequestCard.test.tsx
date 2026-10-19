import { afterEach, describe, expect, it, vi } from "vitest";

import { RequestStatus } from "@api/__generated__/types";
import { render, screen } from "@test/test-utils";

import { RecentRequestCard } from "../RecentRequestCard";
import { createFlatTrackRow } from "./fixtures";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="cover" />,
}));

describe("RecentRequestCard", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders the track title, parent name and a relative time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T01:00:00Z"));

    render(<RecentRequestCard request={createFlatTrackRow({ title: "Avril 14th" })} layout="tile" />);

    expect(screen.getByText("Avril 14th")).toBeInTheDocument();
    expect(screen.getByText("Drukqs")).toBeInTheDocument();
    expect(screen.getByText("1h ago")).toBeInTheDocument();
  });

  it("renders the localized album art alt text when the parent has artwork", () => {
    render(<RecentRequestCard request={createFlatTrackRow()} layout="tile" />);

    expect(screen.getByAltText("Album art for Drukqs")).toBeInTheDocument();
  });

  it("renders the placeholder when the parent has no artwork", () => {
    const request = createFlatTrackRow({
      parent: { ...createFlatTrackRow().parent, album_art: null },
    });

    render(<RecentRequestCard request={request} layout="tile" />);

    expect(screen.queryByTestId("cover")).not.toBeInTheDocument();
  });

  it("reflects the request status in the badge", () => {
    render(<RecentRequestCard request={createFlatTrackRow({ status: RequestStatus.enum.failed })} layout="row" />);

    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("stacks time and badge above the artwork in the tile layout", () => {
    render(<RecentRequestCard request={createFlatTrackRow()} layout="tile" />);

    expect(screen.getByRole("article")).toHaveClass("[grid-template-areas:'time_badge'_'main_main']");
  });

  it("puts the artwork, time and badge on one line in the row layout", () => {
    render(<RecentRequestCard request={createFlatTrackRow()} layout="row" />);

    expect(screen.getByRole("article")).toHaveClass("[grid-template-areas:'main_time_badge']");
  });
});
