import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createPlayerActions, createPlayerView } from "@test/factories";

import { PlayerMasthead } from "../PlayerMasthead";
import type { PlayerView } from "../types";

function renderMasthead(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const view = createPlayerView(overrides);
  render(<PlayerMasthead view={view} actions={actions} />);
  return { actions, view, user: userEvent.setup() };
}

describe("the player in the phone's header", () => {
  it("names the playing track and its artist", () => {
    const { view } = renderMasthead();

    expect(screen.getByText(view.track.title)).toBeInTheDocument();
    expect(screen.getByText(view.track.artist)).toBeInTheDocument();
  });

  it("opens the full stage from the track", async () => {
    const { actions, user } = renderMasthead();

    await user.click(screen.getByRole("button", { name: /Open the full screen session/ }));

    expect(actions.toggleFullscreen).toHaveBeenCalledTimes(1);
    expect(actions.togglePlay).not.toHaveBeenCalled();
  });

  it("puts the title and artist it draws ahead of the action in the name of the open button", () => {
    const { view } = renderMasthead();

    const open = screen.getByRole("button", { name: /Open the full screen session/ });

    expect(open.getAttribute("aria-label")).toContain(
      `${view.track.title} ${view.track.artist} Open the full screen session`
    );
    expect(open).toHaveAttribute("title", "Open the full screen session");
  });

  it.each([
    [true, "Pause"],
    [false, "Play"],
  ])("toggles playback from one button while playing is %s", async (playing, label) => {
    const { actions, user } = renderMasthead({ playing });

    await user.click(screen.getByRole("button", { name: label }));

    expect(actions.togglePlay).toHaveBeenCalledTimes(1);
  });

  it("skips to the next track", async () => {
    const { actions, user } = renderMasthead();

    await user.click(screen.getByRole("button", { name: "Next track" }));

    expect(actions.next).toHaveBeenCalledTimes(1);
  });

  it("keeps the more controls one tap away", async () => {
    const { user } = renderMasthead();

    await user.click(screen.getByRole("button", { name: "More controls" }));

    expect(await screen.findByText("Queue")).toBeInTheDocument();
  });
});
