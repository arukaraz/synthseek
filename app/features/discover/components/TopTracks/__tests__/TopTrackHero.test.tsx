import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { TopTrackHero } from "../TopTrackHero";
import { createTopTrack } from "./fixtures";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="hero-cover" />,
}));

describe("TopTrackHero", () => {
  it("renders the title, artist and the number-one rank badge", () => {
    render(<TopTrackHero track={createTopTrack({ title: "Avril 14th", artist: "Aphex Twin" })} />);

    expect(screen.getByRole("heading", { level: 3, name: "Avril 14th" })).toBeInTheDocument();
    expect(screen.getByText("Aphex Twin")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("#1 most played")).toBeInTheDocument();
  });

  it("renders the album cover when artwork is present", () => {
    render(<TopTrackHero track={createTopTrack({ albumImage: "https://img/cover.jpg" })} />);

    expect(screen.getByTestId("hero-cover")).toBeInTheDocument();
  });

  it("renders a gradient fallback when there is no album image", () => {
    const { container } = render(<TopTrackHero track={createTopTrack({ albumImage: null })} />);

    expect(screen.queryByTestId("hero-cover")).not.toBeInTheDocument();
    expect(container.querySelector("[style*='background']")).not.toBeNull();
  });

  it("renders a formatted play count when present", () => {
    render(<TopTrackHero track={createTopTrack({ playcount: 4200 })} />);

    expect(screen.getByText("4.2k plays")).toBeInTheDocument();
  });

  it("omits the play count line when playcount is null", () => {
    render(<TopTrackHero track={createTopTrack({ playcount: null })} />);

    expect(screen.queryByText(/plays/)).not.toBeInTheDocument();
  });
});
