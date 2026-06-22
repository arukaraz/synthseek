import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { RecentScrobbleNode } from "../RecentScrobbleNode";
import { createScrobble } from "./fixtures";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="cover" />,
}));

describe("RecentScrobbleNode", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the title, artist and a relative age", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00.000Z"));

    render(<RecentScrobbleNode scrobble={createScrobble({ playedAt: "2026-05-29T11:55:00.000Z" })} />);

    expect(screen.getByText("Windowlicker")).toBeInTheDocument();
    expect(screen.getByText("Aphex Twin")).toBeInTheDocument();
    expect(screen.getByText("5m ago")).toBeInTheDocument();
  });

  it("renders the album cover image when artwork is present", () => {
    render(<RecentScrobbleNode scrobble={createScrobble({ albumImage: "https://img/cover.jpg" })} />);

    expect(screen.getByTestId("cover")).toBeInTheDocument();
  });

  it("renders a gradient fallback when there is no album image", () => {
    const { container } = render(<RecentScrobbleNode scrobble={createScrobble({ albumImage: null })} />);

    expect(screen.queryByTestId("cover")).not.toBeInTheDocument();
    const fallback = container.querySelector("[style*='background']");
    expect(fallback).not.toBeNull();
  });
});
