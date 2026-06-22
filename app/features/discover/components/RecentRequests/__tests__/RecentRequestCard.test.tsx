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

    render(<RecentRequestCard request={createFlatTrackRow({ title: "Avril 14th" })} />);

    expect(screen.getByText("Avril 14th")).toBeInTheDocument();
    expect(screen.getByText("Drukqs")).toBeInTheDocument();
    expect(screen.getByText("1h ago")).toBeInTheDocument();
  });

  it("renders the album art when the parent has artwork", () => {
    render(<RecentRequestCard request={createFlatTrackRow()} />);

    expect(screen.getByAltText("Album art for Drukqs")).toBeInTheDocument();
  });

  it("renders the placeholder when the parent has no artwork", () => {
    const request = createFlatTrackRow({
      parent: { ...createFlatTrackRow().parent, album_art: null },
    });

    render(<RecentRequestCard request={request} />);

    expect(screen.queryByTestId("cover")).not.toBeInTheDocument();
  });

  it("reflects the request status in the badge", () => {
    render(<RecentRequestCard request={createFlatTrackRow({ status: RequestStatus.enum.failed })} />);

    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
