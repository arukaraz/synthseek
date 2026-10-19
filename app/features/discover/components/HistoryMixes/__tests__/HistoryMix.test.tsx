import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { HistoryMix } from "../HistoryMix";
import { OnRepeat } from "../OnRepeat";

const { playEntity, onRepeatQuery } = vi.hoisted(() => ({
  playEntity: vi.fn(),
  onRepeatQuery: vi.fn(),
}));

vi.mock("@hooks/ui/useEntityPlayback", () => ({ useEntityPlayback: () => ({ playEntity }) }));
vi.mock("@hooks/api/queries/analytics/useOnRepeat", () => ({ useOnRepeat: () => onRepeatQuery() }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

const READY = { data: { trackIds: ["t1", "t2"], covers: ["a.jpg"] }, isLoading: false, isError: false };

afterEach(() => {
  vi.clearAllMocks();
});

describe("HistoryMix", () => {
  it("shows a placeholder while the set loads", () => {
    render(<HistoryMix kind="deepCuts" query={{ data: undefined, isLoading: true, isError: false }} info="x" />);

    expect(screen.getByRole("status", { name: "Deep cuts" })).toBeInTheDocument();
  });

  it("plays the whole set, replacing the queue, from the play button", () => {
    render(<HistoryMix kind="rewind" query={READY} info="x" />);

    expect(screen.getByText("What you played most back then and stopped playing.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play Repeat rewind" }));

    expect(playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["t1", "t2"] });
  });

  it("explains an empty set and offers nothing to play", () => {
    render(
      <HistoryMix
        kind="forgottenFavorites"
        query={{ data: { trackIds: [], covers: [] }, isLoading: false, isError: false }}
        info="x"
      />
    );

    expect(screen.getByText("You have played every favorite recently.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Play/ })).not.toBeInTheDocument();
  });

  it("reports a failed refresh instead of playing the stale set it still holds", () => {
    render(<HistoryMix kind="onRepeat" query={{ ...READY, isError: true }} info="x" />);

    expect(screen.getByText("Couldn't load your listening history.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Play/ })).not.toBeInTheDocument();
  });

  it("feeds each widget from its own listening query", () => {
    onRepeatQuery.mockReturnValue(READY);
    render(<OnRepeat info="Your most played tracks" />);

    expect(screen.getByRole("heading", { name: "On repeat" })).toBeInTheDocument();
    expect(screen.getByText("2 tracks")).toBeInTheDocument();
  });
});
