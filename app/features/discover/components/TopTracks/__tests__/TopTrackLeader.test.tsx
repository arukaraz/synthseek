import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { TopTrackLeader } from "../TopTrackLeader";
import { createTopTrack } from "./fixtures";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="leader-cover" />,
}));

describe("TopTrackLeader", () => {
  it("renders the rank, title, artist and the number-one badge", () => {
    render(<TopTrackLeader track={createTopTrack({ title: "Avril 14th", artist: "Aphex Twin" })} />);

    expect(screen.getByRole("heading", { level: 3, name: "Avril 14th" })).toBeInTheDocument();
    expect(screen.getByText("Aphex Twin")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("#1 most played")).toBeInTheDocument();
  });

  it("renders a formatted play count when present and omits it when null", () => {
    const { unmount } = render(<TopTrackLeader track={createTopTrack({ playcount: 4200 })} />);
    expect(screen.getByText("4.2k plays")).toBeInTheDocument();
    unmount();

    render(<TopTrackLeader track={createTopTrack({ playcount: null })} />);
    expect(screen.queryByText(/plays/)).not.toBeInTheDocument();
  });
});
