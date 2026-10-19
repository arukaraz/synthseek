import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createPlayerActions, createPlayerView } from "@test/factories";
import enPlayer from "@modules/i18n/messages/en/player.json";

import { PlayerMoreMenu } from "../PlayerMoreMenu";

vi.mock("@hooks/ui/useMediaQuery", () => ({ useMediaQuery: () => false }));

function renderPhoneMenu(view = createPlayerView()) {
  const actions = createPlayerActions();
  render(<PlayerMoreMenu view={view} actions={actions} />);
  return { actions, user: userEvent.setup() };
}

async function openSheet(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: new RegExp(`^${enPlayer.controls.more}`) }));
  return screen.findByRole("dialog");
}

describe("the more menu on a phone", () => {
  it("opens as a bottom sheet holding the same grouped actions", async () => {
    const { user } = renderPhoneMenu();

    const sheet = await openSheet(user);

    expect(sheet).toHaveTextContent(enPlayer.menu.playback);
    expect(screen.getByRole("menuitemcheckbox", { name: enPlayer.controls.shuffle })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: enPlayer.controls.lyrics })).toBeInTheDocument();
  });

  it("titles the sheet plainly while the button still announces what needs attention", async () => {
    const { user } = renderPhoneMenu(createPlayerView({ scrobble: "retrying" }));
    const trigger = screen.getByRole("button", { name: new RegExp(`^${enPlayer.controls.more}`) });

    const sheet = await openSheet(user);

    expect(trigger).toHaveAccessibleName(`${enPlayer.controls.more}: ${enPlayer.scrobble.retrying}`);
    expect(sheet).toHaveAccessibleName(enPlayer.controls.more);
  });

  it("keeps the sheet open for a toggle and for repeat, and closes it for an action", async () => {
    const { user, actions } = renderPhoneMenu();
    await openSheet(user);

    await user.click(screen.getByRole("menuitemcheckbox", { name: enPlayer.controls.shuffle }));
    await user.click(screen.getByRole("menuitem", { name: new RegExp(`^${enPlayer.menu.repeat}`) }));
    expect(actions.toggleShuffle).toHaveBeenCalledTimes(1);
    expect(actions.cycleRepeat).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: enPlayer.controls.lyrics }));
    expect(actions.openLyrics).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
