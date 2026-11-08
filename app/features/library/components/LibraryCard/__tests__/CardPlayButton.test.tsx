import { describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen, waitFor } from "@test/test-utils";

import { CardPlayButton } from "../CardPlayButton";

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("CardPlayButton", () => {
  it("names an in-order play and a shuffle differently", () => {
    const { rerender } = renderWithProviders(
      <CardPlayButton name="Discovery" order="inOrder" onPlay={vi.fn(async () => undefined)} placement="corner" />
    );
    expect(screen.getByRole("button", { name: "Play everything we have of Discovery" })).toBeInTheDocument();

    rerender(
      <CardPlayButton name="Discovery" order="shuffled" onPlay={vi.fn(async () => undefined)} placement="corner" />
    );
    expect(screen.getByRole("button", { name: "Shuffle everything we have of Discovery" })).toBeInTheDocument();
  });

  it("starts playback once and stays disabled until it has started", async () => {
    const start = deferred();
    const onPlay = vi.fn(() => start.promise);
    const { user } = renderWithProviders(
      <CardPlayButton name="Discovery" order="inOrder" onPlay={onPlay} placement="inline" />
    );
    const button = screen.getByRole("button");

    await user.click(button);
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onPlay).toHaveBeenCalledTimes(1);

    start.resolve();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it("keeps its click and keys from reaching the card around it", async () => {
    const onCardClick = vi.fn();
    const onCardKey = vi.fn();
    const { user } = renderWithProviders(
      <div role="presentation" onClick={onCardClick} onKeyDown={onCardKey}>
        <CardPlayButton name="Discovery" order="inOrder" onPlay={vi.fn(async () => undefined)} placement="corner" />
      </div>
    );

    await user.click(screen.getByRole("button"));
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });

    expect(onCardClick).not.toHaveBeenCalled();
    expect(onCardKey).not.toHaveBeenCalled();
  });
});
