import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { LastYear } from "../LastYear";

const { playEntity, weekQuery } = vi.hoisted(() => ({ playEntity: vi.fn(), weekQuery: vi.fn() }));

vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity }) }));
vi.mock("@hooks/api/queries/analytics/useLastYear", () => ({ useLastYear: () => weekQuery() }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

const WEEK = {
  from: new Date("2025-10-15T12:00:00Z"),
  to: new Date("2025-10-22T12:00:00Z"),
  plays: 12,
  minutes: 135,
  topArtist: "Bjork",
  tracks: [
    { trackId: "t1", title: "Joga", artist: "Bjork", cover: null, plays: 4 },
    { trackId: "t2", title: "Hunter", artist: "Bjork", cover: "h.jpg", plays: 1 },
  ],
  trackIds: ["t1", "t2"],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("LastYear", () => {
  it("summarises the week and ranks its tracks", () => {
    weekQuery.mockReturnValue({ data: WEEK, isLoading: false, isError: false });
    renderWithProviders(<LastYear size="M" info="x" />);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("2h")).toBeInTheDocument();
    expect(screen.getAllByText("Bjork").length).toBeGreaterThan(1);
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Joga");
    expect(rows[0]).toHaveTextContent("4 plays");
    expect(rows[1]).toHaveTextContent("1 play");
  });

  it("plays that week's tracks from the header", () => {
    weekQuery.mockReturnValue({ data: WEEK, isLoading: false, isError: false });
    renderWithProviders(<LastYear size="M" info="x" />);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    expect(playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["t1", "t2"] });
  });

  it("explains a silent week and offers nothing to play", () => {
    weekQuery.mockReturnValue({
      data: { ...WEEK, plays: 0, tracks: [], trackIds: [], topArtist: null },
      isLoading: false,
      isError: false,
    });
    renderWithProviders(<LastYear size="M" info="x" />);

    expect(screen.getByText("You played nothing this week last year.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play" })).not.toBeInTheDocument();
  });

  it("reports a failed load", () => {
    weekQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<LastYear size="M" info="x" />);

    expect(screen.getByText("Couldn't load your listening history.")).toBeInTheDocument();
  });
});
