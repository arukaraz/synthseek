import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { Stations } from "../Stations";

const { startRadio, stationsQuery } = vi.hoisted(() => ({ startRadio: vi.fn(), stationsQuery: vi.fn() }));

vi.mock("@hooks/ui/player", () => ({ useStartRadio: () => startRadio }));
vi.mock("@hooks/api/queries/analytics/useStations", () => ({ useStations: () => stationsQuery() }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

const STATIONS = [
  { id: "artist:Bjork", kind: "artist", artist: "Bjork", covers: [], seed: { kind: "artist", artist: "Bjork" } },
  { id: "favorites", kind: "favorites", artist: null, covers: [], seed: { kind: "tracks", trackIds: ["f1"] } },
  { id: "unplayed", kind: "unplayed", artist: null, covers: [], seed: { kind: "tracks", trackIds: ["u1"] } },
];

afterEach(() => {
  vi.clearAllMocks();
});

describe("Stations", () => {
  it("names artist stations after the artist and the others after what seeds them", () => {
    stationsQuery.mockReturnValue({ data: STATIONS, isLoading: false, isError: false });
    renderWithProviders(<Stations size="L" info="x" />);

    expect(screen.getByRole("heading", { level: 3, name: "Bjork" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Your favorites" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Never played" })).toBeInTheDocument();
    expect(screen.getByText("Artist radio")).toBeInTheDocument();
  });

  it("starts a radio from the station's seed", () => {
    stationsQuery.mockReturnValue({ data: STATIONS, isLoading: false, isError: false });
    renderWithProviders(<Stations size="L" info="x" />);

    fireEvent.click(screen.getByRole("button", { name: "Start Your favorites radio" }));

    expect(startRadio).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["f1"] }, null);
  });

  it("lays every station on a horizontal rail at half width, scrollable from the keyboard", () => {
    stationsQuery.mockReturnValue({ data: STATIONS, isLoading: false, isError: false });
    renderWithProviders(<Stations size="M" info="x" />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getByRole("region", { name: "All stations, scroll sideways" })).toHaveAttribute("tabindex", "0");
  });

  it("explains the empty state", () => {
    stationsQuery.mockReturnValue({ data: [], isLoading: false, isError: false });
    renderWithProviders(<Stations size="L" info="x" />);

    expect(screen.getByText("Play some music and your stations show up here.")).toBeInTheDocument();
  });
});
