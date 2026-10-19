import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

import { AnalyticsBoard } from "../AnalyticsBoard";

const device = vi.hoisted(() => ({ value: "wide" }));

vi.mock("@hooks/ui/board/useBoardDevice", () => ({ useBoardDevice: () => device.value }));

function stub(id: string) {
  return function Stub() {
    return <div data-testid={id} />;
  };
}

vi.mock("../PlaysTile", () => ({ PlaysTile: stub("plays") }));
vi.mock("../ListeningTimeTile", () => ({ ListeningTimeTile: stub("time") }));
vi.mock("../AddedTile", () => ({ AddedTile: stub("added") }));
vi.mock("../DownloadsTile", () => ({ DownloadsTile: stub("downloads") }));
vi.mock("../DecadesTile", () => ({ DecadesTile: stub("decades") }));
vi.mock("../QualityTile", () => ({ QualityTile: stub("quality") }));
vi.mock("../ScrobblesTile", () => ({ ScrobblesTile: stub("scrobbles") }));
vi.mock("../GrowthTile", () => ({ GrowthTile: stub("growth") }));
vi.mock("../ListeningClockTile", () => ({ ListeningClockTile: stub("clock") }));
vi.mock("../../LibraryLeaderboard", () => ({ LibraryLeaderboard: stub("leaderboard") }));

const ORDER = [
  "plays",
  "time",
  "added",
  "downloads",
  "decades",
  "quality",
  "scrobbles",
  "growth",
  "clock",
  "leaderboard",
];

function spans() {
  return ORDER.map((id) => {
    const cell = screen.getByTestId(id).parentElement;
    return `${cell?.style.getPropertyValue("--cell-cols")}x${cell?.style.getPropertyValue("--cell-rows")}`;
  });
}

describe("AnalyticsBoard", () => {
  it("lays the ten widgets out in order with their wide sizes", () => {
    device.value = "wide";
    renderWithProviders(<AnalyticsBoard />);

    expect(screen.getByRole("heading", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getAllByTestId(/./).map((node) => node.dataset.testid)).toEqual(ORDER);
    expect(spans()).toEqual(["3x2", "3x2", "3x2", "3x2", "6x4", "6x4", "6x4", "6x4", "12x4", "12x4"]);
  });

  it("uses the narrow spans on a phone", () => {
    device.value = "narrow";
    renderWithProviders(<AnalyticsBoard />);

    expect(spans()).toEqual(["2x2", "2x2", "2x2", "2x2", "4x4", "4x4", "4x4", "4x4", "4x5", "4x5"]);
  });
});
