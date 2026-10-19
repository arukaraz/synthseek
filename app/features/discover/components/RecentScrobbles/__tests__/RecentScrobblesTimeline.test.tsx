import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { RecentScrobblesTimeline } from "../RecentScrobblesTimeline";
import { createScrobble } from "./fixtures";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="cover" />,
}));

describe("RecentScrobblesTimeline", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders one ordered row per scrobble, newest first as given", () => {
    render(
      <RecentScrobblesTimeline
        scrobbles={[
          createScrobble({ catalogTrackId: "a", title: "Windowlicker" }),
          createScrobble({ catalogTrackId: "b", title: "Avril 14th" }),
        ]}
      />
    );

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Windowlicker");
    expect(rows[1]).toHaveTextContent("Avril 14th");
  });

  it("renders the relative age, title and artist on each row", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00.000Z"));

    render(<RecentScrobblesTimeline scrobbles={[createScrobble({ playedAt: "2026-05-29T11:55:00.000Z" })]} />);

    expect(screen.getByText("5m ago")).toBeInTheDocument();
    expect(screen.getByText("Windowlicker")).toBeInTheDocument();
    expect(screen.getByText("Aphex Twin")).toBeInTheDocument();
  });

  it("renders the cover when artwork exists and a gradient fallback otherwise", () => {
    const { container } = render(
      <RecentScrobblesTimeline
        scrobbles={[
          createScrobble({ catalogTrackId: "a", albumImage: "https://img/cover.jpg" }),
          createScrobble({ catalogTrackId: "b", albumImage: null }),
        ]}
      />
    );

    expect(screen.getAllByTestId("cover")).toHaveLength(1);
    expect(container.querySelector("[style*='background']")).not.toBeNull();
  });
});
