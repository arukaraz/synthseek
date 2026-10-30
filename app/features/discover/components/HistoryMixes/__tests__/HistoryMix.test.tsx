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
    render(
      <HistoryMix kind="deepCuts" query={{ data: undefined, isLoading: true, isError: false }} size="S" info="x" />
    );

    expect(screen.getByRole("status", { name: "Deep cuts" })).toBeInTheDocument();
  });

  it("plays the whole set, replacing the queue, from the play button", () => {
    render(<HistoryMix kind="rewind" query={READY} size="S" info="x" />);

    expect(screen.getByText("What you played most back then and stopped playing.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play Repeat rewind" }));

    expect(playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["t1", "t2"] });
  });

  it("explains an empty set and offers nothing to play", () => {
    render(
      <HistoryMix
        kind="forgottenFavorites"
        query={{ data: { trackIds: [], covers: [] }, isLoading: false, isError: false }}
        size="S"
        info="x"
      />
    );

    expect(screen.getByText("You have played every favorite recently.")).toBeInTheDocument();
    expect(screen.getByText("0 tracks")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Play/ })).not.toBeInTheDocument();
  });

  it("reports a failed refresh instead of playing the stale set it still holds", () => {
    render(<HistoryMix kind="onRepeat" query={{ ...READY, isError: true }} size="S" info="x" />);

    expect(screen.getByText("Couldn't load your listening history.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Play/ })).not.toBeInTheDocument();
  });

  it("stacks the cover over the details in a quarter tile", () => {
    const { container } = render(<HistoryMix kind="rewind" query={READY} size="S" info="x" />);

    expect(container.querySelector("article")).not.toHaveClass("flex-row");
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("puts the cover beside the details at half width", () => {
    const { container } = render(<HistoryMix kind="rewind" query={READY} size="M" info="x" />);

    expect(container.querySelector("article")).toHaveClass("flex-row");
    expect(container.querySelector(".grid-cols-4")).toBeNull();
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("lays four covers side by side across a full row, padding the ones it does not have", () => {
    const { container } = render(<HistoryMix kind="rewind" query={READY} size="L" info="x" />);

    expect(container.querySelector("article")).toHaveClass("flex-row");
    expect(container.querySelector(".grid-cols-4")).not.toBeNull();
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelectorAll("div[style*='linear-gradient']")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Play Repeat rewind" }));
    expect(playEntity).toHaveBeenCalledWith({ kind: "tracks", trackIds: ["t1", "t2"] });
  });

  it("feeds each widget from its own listening query", () => {
    onRepeatQuery.mockReturnValue(READY);
    render(<OnRepeat size="S" info="Your most played tracks" />);

    expect(screen.getByRole("heading", { name: "On repeat" })).toBeInTheDocument();
    expect(screen.getByText("2 tracks")).toBeInTheDocument();
  });
});
