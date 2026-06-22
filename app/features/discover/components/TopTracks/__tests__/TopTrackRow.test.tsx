import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { TopTrackRow } from "../TopTrackRow";
import { createTopTrack } from "./fixtures";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="row-cover" />,
}));

describe("TopTrackRow", () => {
  it("renders the supplied rank, title and artist", () => {
    render(<TopTrackRow track={createTopTrack({ title: "Xtal", artist: "Aphex Twin" })} rank={4} />);

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Xtal")).toBeInTheDocument();
    expect(screen.getByText("Aphex Twin")).toBeInTheDocument();
  });

  it("renders the album cover when artwork is present", () => {
    render(<TopTrackRow track={createTopTrack({ albumImage: "https://img/row.jpg" })} rank={2} />);

    expect(screen.getByTestId("row-cover")).toBeInTheDocument();
  });

  it("renders a gradient fallback when there is no album image", () => {
    const { container } = render(<TopTrackRow track={createTopTrack({ albumImage: null })} rank={2} />);

    expect(screen.queryByTestId("row-cover")).not.toBeInTheDocument();
    expect(container.querySelector("[style*='background']")).not.toBeNull();
  });

  it("renders a compact play count when present", () => {
    render(<TopTrackRow track={createTopTrack({ playcount: 15678 })} rank={3} />);

    expect(screen.getByText("16k")).toBeInTheDocument();
  });

  it("omits the play count when it is null", () => {
    const { container } = render(<TopTrackRow track={createTopTrack({ playcount: null })} rank={3} />);

    expect(container.textContent).not.toMatch(/k$/);
  });
});
