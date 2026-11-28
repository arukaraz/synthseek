import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createPlayerActions, createPlayerTrack, createPlayerView } from "@test/factories";
import { readAnnouncement, resetAnnouncements } from "@utils/announcer";
import enPlayer from "@modules/i18n/messages/en/player.json";

import { QueueBody } from "../QueueBody";
import type { PlayerActions, PlayerQueueEntry, PlayerView } from "../types";

const accessibility = vi.hoisted(() => ({ mode: false }));

vi.mock("@modules/providers/AccessibilityProvider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@modules/providers/AccessibilityProvider")>();
  return { ...actual, useAccessibility: () => ({ ...actual.useAccessibility(), mode: accessibility.mode }) };
});

class StubIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const IDS = ["a", "b", "c", "d"];

function entries(ids: string[], offset = 1): PlayerQueueEntry[] {
  return ids.map((id, index) => ({
    index: index + offset,
    track: createPlayerTrack({ id, title: `Song ${id}`, artist: "Band" }),
  }));
}

function renderQueue(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const radio = entries(["r1", "r2"], 10);
  const view = createPlayerView({
    queueEditable: true,
    queue: { playing: null, upNext: entries(IDS), autoplay: radio, loop: [] },
    ...overrides,
  });
  render(<QueueBody view={view} actions={actions} />);
  return { actions, radio, user: userEvent.setup() };
}

function jump(id: string): HTMLElement {
  return screen.getByRole("button", { name: `Play Song ${id}` });
}

function sentOrder(actions: PlayerActions, call: number): string[] {
  const [tracks] = vi.mocked(actions.reorderQueue).mock.calls[call] ?? [];
  return (tracks ?? []).map((track) => track.id);
}

beforeEach(() => {
  accessibility.mode = false;
  resetAnnouncements();
  vi.stubGlobal("IntersectionObserver", StubIntersectionObserver);
});

afterEach(() => {
  resetAnnouncements();
});

describe("the queue as a list", () => {
  it("is a named list whose rows know their place in it", () => {
    renderQueue();

    const list = screen.getByRole("list", { name: enPlayer.queue.upNext });
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.getAttribute("aria-posinset"))).toEqual(["1", "2", "3", "4"]);
    expect(rows.every((row) => row.getAttribute("aria-setsize") === "4")).toBe(true);
  });

  it("gives the radio picks a list of their own", () => {
    renderQueue();

    const list = screen.getByRole("list", { name: enPlayer.queue.autoplay });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });
});

describe("moving a queued track from the keyboard", () => {
  it("moves it one place with Alt and an arrow, through the same call dragging makes", async () => {
    const { actions, radio, user } = renderQueue();

    jump("b").focus();
    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");

    expect(actions.reorderQueue).toHaveBeenCalledTimes(1);
    expect(sentOrder(actions, 0)).toEqual(["b", "a", "c", "d", ...radio.map((entry) => entry.track.id)]);
  });

  it("moves it one place down", async () => {
    const { actions, user } = renderQueue();

    jump("b").focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

    expect(sentOrder(actions, 0).slice(0, 4)).toEqual(["a", "c", "b", "d"]);
  });

  it("sends it to the top and to the bottom with Alt and Shift", async () => {
    const { actions, user } = renderQueue();

    jump("c").focus();
    await user.keyboard("{Alt>}{Shift>}{ArrowUp}{/Shift}{/Alt}");
    expect(sentOrder(actions, 0).slice(0, 4)).toEqual(["c", "a", "b", "d"]);

    await user.keyboard("{Alt>}{Shift>}{ArrowDown}{/Shift}{/Alt}");
    expect(sentOrder(actions, 1).slice(0, 4)).toEqual(["a", "b", "d", "c"]);
  });

  it("does nothing at the edge it cannot go past", async () => {
    const { actions, user } = renderQueue();

    jump("a").focus();
    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");

    expect(actions.reorderQueue).not.toHaveBeenCalled();
  });

  it("leaves the plain arrows alone, so they keep scrolling and navigating", async () => {
    const { actions, user } = renderQueue();

    jump("b").focus();
    await user.keyboard("{ArrowUp}{ArrowDown}");

    expect(actions.reorderQueue).not.toHaveBeenCalled();
  });

  it("says where the track went through the announcer", async () => {
    const { user } = renderQueue();

    jump("b").focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

    expect(readAnnouncement().text).toBe("Song b moved to position 3 of 4");
  });

  it("advertises the keys on the row", () => {
    renderQueue();

    expect(jump("b")).toHaveAttribute("aria-keyshortcuts", expect.stringContaining("Alt+ArrowUp"));
  });

  it("does not move radio picks, which are not the listener's to order", async () => {
    const { actions, user } = renderQueue();

    screen.getByRole("button", { name: "Play Song r1" }).focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

    expect(actions.reorderQueue).not.toHaveBeenCalled();
  });
});

describe("the move menu on a queued track", () => {
  it("is absent without the accessibility mode, so the row looks as it does today", () => {
    renderQueue();

    expect(screen.queryByRole("button", { name: "Move Song b" })).not.toBeInTheDocument();
  });

  it("is on every movable row in the accessibility mode", () => {
    accessibility.mode = true;
    renderQueue();

    expect(screen.getAllByRole("button", { name: /^Move Song/ })).toHaveLength(4);
  });

  it("offers only the moves that change something", async () => {
    accessibility.mode = true;
    const { user } = renderQueue();

    await user.click(screen.getByRole("button", { name: "Move Song a" }));

    const names = (await screen.findAllByRole("menuitem")).map((item) => item.textContent);
    expect(names).toEqual([enPlayer.queueMove.down, enPlayer.queueMove.bottom]);
  });

  it("calls the same reorder as dragging and the keys", async () => {
    accessibility.mode = true;
    const { actions, user } = renderQueue();

    await user.click(screen.getByRole("button", { name: "Move Song c" }));
    await user.click(await screen.findByRole("menuitem", { name: enPlayer.queueMove.top }));

    expect(actions.reorderQueue).toHaveBeenCalledTimes(1);
    expect(sentOrder(actions, 0).slice(0, 4)).toEqual(["c", "a", "b", "d"]);
    expect(readAnnouncement().text).toBe("Song c moved to position 1 of 4");
  });

  it("is not on a queue the listener cannot edit", () => {
    accessibility.mode = true;
    renderQueue({ queueEditable: false });

    expect(screen.queryByRole("button", { name: /^Move Song/ })).not.toBeInTheDocument();
  });
});
