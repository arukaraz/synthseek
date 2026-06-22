import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { DiscoverScreen } from "../DiscoverScreen";

vi.mock("../../../components/TrendingHero/TrendingHero", () => ({
  TrendingHero: () => <div data-testid="trending-hero" />,
}));
vi.mock("../../../components/LibraryLeaderboard/LibraryLeaderboard", () => ({
  LibraryLeaderboard: () => <div data-testid="library-leaderboard" />,
}));
vi.mock("../../../components/DiscoveryMixes", () => ({
  DiscoveryMixes: () => <div data-testid="discovery-mixes" />,
}));
vi.mock("../../../components/ArtistSpotlight/ArtistSpotlight", () => ({
  ArtistSpotlight: () => <div data-testid="artist-spotlight" />,
}));
vi.mock("../../../components/RecentScrobbles", () => ({
  RecentScrobbles: () => <div data-testid="recent-scrobbles" />,
}));
vi.mock("../../../components/TopTracks", () => ({
  TopTracks: () => <div data-testid="top-tracks" />,
}));
vi.mock("../../../components/CategoriesGrid/CategoriesGrid", () => ({
  CategoriesGrid: () => <div data-testid="categories-grid" />,
}));
vi.mock("../../../components/RecentRequests/RecentRequests", () => ({
  RecentRequests: () => <div data-testid="recent-requests" />,
}));

describe("DiscoverScreen", () => {
  it("renders a screen-reader heading for the page", () => {
    render(<DiscoverScreen />);

    expect(screen.getByRole("heading", { name: "Discover" })).toBeInTheDocument();
  });

  it("composes every discover widget exactly once", () => {
    render(<DiscoverScreen />);

    for (const testId of [
      "trending-hero",
      "library-leaderboard",
      "discovery-mixes",
      "artist-spotlight",
      "recent-scrobbles",
      "top-tracks",
      "categories-grid",
      "recent-requests",
    ]) {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
  });
});
