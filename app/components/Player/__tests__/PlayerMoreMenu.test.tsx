import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { createPlayerActions, createPlayerDevice, createPlayerView } from "@test/factories";
import enPlayer from "@modules/i18n/messages/en/player.json";

import { PlayerMoreMenu } from "../PlayerMoreMenu";
import {
  DEVICES_TOGGLE_SELECTOR,
  MODES_TOGGLE_SELECTOR,
  MORE_TOGGLE_SELECTOR,
  QUEUE_TOGGLE_SELECTOR,
  SETTINGS_TOGGLE_SELECTOR,
} from "../constants";
import type { PlayerView } from "../types";

describe("where the panels anchor on a narrow bar", () => {
  it("falls back to the more button only after the desktop toggle, which wins wherever it is visible", () => {
    for (const selector of [
      DEVICES_TOGGLE_SELECTOR,
      SETTINGS_TOGGLE_SELECTOR,
      QUEUE_TOGGLE_SELECTOR,
      MODES_TOGGLE_SELECTOR,
    ]) {
      const parts = selector.split(", ");
      expect(parts).toHaveLength(2);
      expect(parts[0]).not.toBe(MORE_TOGGLE_SELECTOR);
      expect(parts[1]).toBe(MORE_TOGGLE_SELECTOR);
    }
  });

  it("gives the more button the attribute those selectors look for", () => {
    render(<PlayerMoreMenu view={createPlayerView()} actions={createPlayerActions()} />);

    expect(document.querySelector(MORE_TOGGLE_SELECTOR)).toBe(
      screen.getByRole("button", { name: enPlayer.controls.more })
    );
  });
});

function renderMenu(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const view = createPlayerView(overrides);
  render(<PlayerMoreMenu view={view} actions={actions} />);
  return { actions, view, user: userEvent.setup() };
}

function trigger(): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`^${enPlayer.controls.more}`) });
}

async function opened(user: ReturnType<typeof userEvent.setup>): Promise<HTMLElement> {
  await user.click(trigger());
  return screen.findByRole("menu");
}

function kitchen() {
  return createPlayerDevice({ id: "kitchen", name: "Kitchen", local: false, active: true });
}

describe("the more menu on the narrow bar", () => {
  it("opens from one labelled button and lays the secondary actions out in groups", async () => {
    const { user } = renderMenu();

    const menu = await opened(user);

    for (const group of [enPlayer.menu.playback, enPlayer.menu.track, enPlayer.menu.sound]) {
      expect(menu).toHaveTextContent(group);
    }
    expect(screen.getByRole("menuitemcheckbox", { name: enPlayer.controls.shuffle })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: new RegExp(`^${enPlayer.menu.repeat}`) })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: new RegExp(`^${enPlayer.queue.title}`) })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: enPlayer.controls.lyrics })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: enPlayer.menu.upgrade })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: new RegExp(`^${enPlayer.controls.devices}`) })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: enPlayer.controls.settings })).toBeInTheDocument();
    expect(screen.getByRole("menuitemcheckbox", { name: enPlayer.controls.chain })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: enPlayer.controls.modes })).toBeInTheDocument();
  });

  it("keeps the same breathing room between icon and label on a toggle as on a plain item", async () => {
    const { user } = renderMenu();
    await opened(user);

    const plain = screen.getByRole("menuitem", { name: enPlayer.controls.lyrics });
    for (const toggle of screen.getAllByRole("menuitemcheckbox")) {
      expect(toggle.className.split(" ")).toContain("gap-2");
      expect(plain.className.split(" ")).toContain("gap-2");
    }
  });

  it("toggles shuffle and the signal chain without closing, so a state change can be seen", async () => {
    const { actions, user } = renderMenu();
    await opened(user);

    await user.click(screen.getByRole("menuitemcheckbox", { name: enPlayer.controls.shuffle }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: enPlayer.controls.chain }));

    expect(actions.toggleShuffle).toHaveBeenCalled();
    expect(actions.toggleChain).toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("cycles repeat in place and names the mode it is in", async () => {
    const { actions, user } = renderMenu({ repeat: "all" });
    await opened(user);
    const repeat = screen.getByRole("menuitem", { name: new RegExp(`^${enPlayer.menu.repeat}`) });
    expect(repeat).toHaveTextContent(enPlayer.menu.repeatState.all);

    await user.click(repeat);

    expect(actions.cycleRepeat).toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("opens the queue, saying how much is still to come, and closes behind it", async () => {
    const track = createPlayerView().track;
    const { actions, user } = renderMenu({
      queue: {
        playing: { index: 0, track },
        upNext: [
          { index: 1, track },
          { index: 2, track },
        ],
      },
    });
    await opened(user);

    await user.click(screen.getByRole("menuitem", { name: new RegExp(`^${enPlayer.queue.title}`) }));

    expect(actions.toggleQueue).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("names the queue length on its item", async () => {
    const track = createPlayerView().track;
    const { user } = renderMenu({
      queue: {
        playing: { index: 0, track },
        upNext: [
          { index: 1, track },
          { index: 2, track },
        ],
      },
    });
    await opened(user);

    expect(screen.getByRole("menuitem", { name: new RegExp(`^${enPlayer.queue.title}`) })).toHaveTextContent(
      enPlayer.menu.upNext_other.replace("{{count}}", "2")
    );
  });

  it("hands the panel openers to their actions", async () => {
    const { actions, user } = renderMenu();
    await opened(user);
    await user.click(screen.getByRole("menuitem", { name: enPlayer.controls.settings }));
    await opened(user);
    await user.click(screen.getByRole("menuitem", { name: new RegExp(`^${enPlayer.controls.devices}`) }));
    await opened(user);
    await user.click(screen.getByRole("menuitem", { name: enPlayer.controls.lyrics }));
    await opened(user);
    await user.click(screen.getByRole("menuitem", { name: enPlayer.menu.upgrade }));
    await opened(user);
    await user.click(screen.getByRole("menuitem", { name: enPlayer.controls.modes }));

    expect(actions.toggleSettings).toHaveBeenCalled();
    expect(actions.toggleDevices).toHaveBeenCalled();
    expect(actions.openLyrics).toHaveBeenCalled();
    expect(actions.searchBetterQuality).toHaveBeenCalled();
    expect(actions.toggleModes).toHaveBeenCalled();
  });

  it("marks the button and names the device while the sound plays somewhere else", async () => {
    const { user } = renderMenu({
      activeDevice: kitchen(),
      devices: [createPlayerDevice({ active: false }), kitchen()],
    });

    expect(trigger()).toHaveAccessibleName(
      `${enPlayer.controls.more}: ${enPlayer.menu.playingOn.replace("{{device}}", "Kitchen")}`
    );
    await opened(user);
    expect(screen.getByRole("menuitem", { name: new RegExp(`^${enPlayer.controls.devices}`) })).toHaveTextContent(
      "Kitchen"
    );
  });

  it("warns on the button when scrobbling is failing, and writes the state on its item", async () => {
    const { actions, user } = renderMenu({ scrobble: "failed", scrobbleActionable: true });

    expect(trigger()).toHaveAccessibleName(`${enPlayer.controls.more}: ${enPlayer.scrobble.failed}`);
    await opened(user);
    const scrobbling = screen.getByRole("menuitemcheckbox", { name: new RegExp(`^${enPlayer.menu.scrobbling}`) });
    expect(scrobbling).toHaveTextContent(enPlayer.menu.scrobblingState.failed);
    expect(scrobbling).toHaveAttribute("aria-checked", "true");

    await user.click(scrobbling);

    expect(actions.toggleScrobbling).toHaveBeenCalled();
  });

  it("leaves scrobbling read-only when no listening service is connected", async () => {
    const { user } = renderMenu({ scrobble: "off", scrobbleActionable: false });
    await opened(user);

    expect(screen.getByRole("menuitem", { name: new RegExp(`^${enPlayer.menu.scrobbling}`) })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("keeps the queue and the settings out of the mini player and offers the way back", async () => {
    const { actions, user } = renderMenu({ mode: "mini" });
    await opened(user);

    expect(screen.queryByRole("menuitem", { name: new RegExp(`^${enPlayer.queue.title}`) })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: enPlayer.controls.settings })).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: enPlayer.controls.exitMini }));

    expect(actions.selectMode).toHaveBeenCalledWith("normal");
  });

  it("offers to leave compact mode from the same place", async () => {
    const { actions, user } = renderMenu({ mode: "compact" });
    await opened(user);

    await user.click(screen.getByRole("menuitem", { name: enPlayer.controls.restoreMode }));

    expect(actions.selectMode).toHaveBeenCalledWith("normal");
  });
});
