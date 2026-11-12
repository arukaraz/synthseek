import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { createPlayerActions, createPlayerView } from "@test/factories";
import enPlayer from "@modules/i18n/messages/en/player.json";

import { PLAYER_HEADER_SLOT_ID } from "../constants";
import { listeningNoticeId, moreAttention, panelOpen } from "../helpers";
import { Player } from "../Player";
import type { PlayerListening, PlayerListeningMember, PlayerView } from "../types";

const sonner = vi.hoisted(() => ({ custom: vi.fn(), dismiss: vi.fn() }));

vi.mock("sonner", () => ({ toast: sonner }));

class FakeResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

function stubMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: !query.includes("prefers-reduced-motion") && !query.includes("max-height"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

function member(overrides: Partial<PlayerListeningMember> = {}): PlayerListeningMember {
  return {
    userId: "u1",
    name: "Ana",
    avatarUrl: null,
    title: "Dreams",
    artist: "Fleetwood Mac",
    album: "Rumours",
    artworkUrl: null,
    playedAt: new Date(),
    client: null,
    playing: true,
    ...overrides,
  };
}

function listening(overrides: Partial<PlayerListening> = {}): PlayerListening {
  return { live: [], earlier: [], roomOpen: false, arrival: null, ...overrides };
}

function crowd(size: number): PlayerListeningMember[] {
  return Array.from({ length: size }, (_, index) => member({ userId: `u${index}`, name: `Member ${index}` }));
}

function renderPlayer(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const view = createPlayerView(overrides);
  const result = render(<Player view={view} actions={actions} />);
  return { ...result, actions, view, user: userEvent.setup() };
}

function countLabel(count: number): string {
  return (count === 1 ? enPlayer.listening.count_one : enPlayer.listening.count_other).replace(
    "{{count}}",
    String(count)
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  stubMatchMedia();
});

afterEach(() => {
  document.getElementById(PLAYER_HEADER_SLOT_ID)?.remove();
});

describe("the listening avatars over the bar", () => {
  it("stay away while nobody else is listening", () => {
    const { container } = renderPlayer();

    expect(container.querySelector("[data-player-room-toggle]")).toBeNull();
  });

  it("show one face per listener and open the room on a press", async () => {
    const { actions, user } = renderPlayer({ listening: listening({ live: crowd(2) }) });

    await user.click(screen.getByRole("button", { name: countLabel(2) }));

    expect(actions.toggleRoom).toHaveBeenCalledTimes(1);
  });

  it("show four faces at most and count the rest over the fourth", () => {
    renderPlayer({ listening: listening({ live: crowd(6) }) });

    const stack = screen.getByRole("button", { name: countLabel(6) });
    expect(stack.children).toHaveLength(4);
    expect(within(stack).getByText("+2")).toBeInTheDocument();
  });

  it("show no counter while everyone fits", () => {
    renderPlayer({ listening: listening({ live: crowd(4) }) });

    expect(screen.getByRole("button", { name: countLabel(4) }).textContent).not.toContain("+");
  });

  it("step aside while a panel is open over the bar", () => {
    const { container } = renderPlayer({ queueOpen: true, listening: listening({ live: crowd(2) }) });

    expect(container.querySelector("[data-player-room-toggle]")).toBeNull();
  });

  it("stay out of the compact header player, which marks its more button instead", () => {
    const slot = document.createElement("div");
    slot.id = PLAYER_HEADER_SLOT_ID;
    document.body.appendChild(slot);

    renderPlayer({ mode: "compact", listening: listening({ live: crowd(2) }) });

    expect(document.querySelector("[data-player-room-toggle]")).toBeNull();
    expect(
      screen.getAllByRole("button", { name: `${enPlayer.controls.more}: ${countLabel(2)}` }).length
    ).toBeGreaterThan(0);
  });
});

describe("the more button's listening mark", () => {
  it("is used only where the avatars are not drawn", () => {
    const view = createPlayerView({ listening: listening({ live: crowd(1) }) });

    expect(moreAttention(view)).toBeNull();
    expect(moreAttention(view, "narrow", true)).toBe("friends");
    expect(moreAttention(view, "wide", true)).toBe("friends");
  });

  it("pulses for an arrival and yields to a private session", () => {
    const arrival = member();
    const view = createPlayerView({ listening: listening({ live: [arrival], arrival }) });

    expect(moreAttention(view, "narrow", true)).toBe("arrival");
    expect(moreAttention({ ...view, privateSession: true }, "narrow", true)).toBe("private");
  });

  it("stays off while nobody is listening", () => {
    expect(moreAttention(createPlayerView(), "narrow", true)).toBeNull();
  });
});

describe("the more menu's listening entry", () => {
  it("says how many are listening and opens the room", async () => {
    const { actions, user } = renderPlayer({ listening: listening({ live: crowd(3) }) });
    const wide = screen
      .getAllByRole("button", { name: enPlayer.controls.more })
      .find((button) => button.classList.contains("hidden"));
    if (wide !== undefined) await user.click(wide);

    const entry = await screen.findByRole("menuitem", { name: new RegExp(enPlayer.listening.title) });
    expect(entry.textContent).toContain(enPlayer.listening.live_other.replace("{{count}}", "3"));
    await user.click(entry);

    expect(actions.toggleRoom).toHaveBeenCalledTimes(1);
  });
});

describe("the listening room", () => {
  it("lists who is listening with their track, and who was with how long ago", () => {
    renderPlayer({
      listening: listening({
        roomOpen: true,
        live: [member({ client: "Symfonium" })],
        earlier: [
          member({
            userId: "u2",
            name: "Luis",
            title: "Roads",
            artist: "Portishead",
            playing: false,
            playedAt: new Date(Date.now() - 5 * 60_000),
          }),
        ],
      }),
    });

    const room = screen.getByRole("dialog", { name: enPlayer.listening.title });
    expect(within(room).getByText("Ana")).toBeInTheDocument();
    expect(within(room).getByText("Symfonium")).toBeInTheDocument();
    expect(within(room).getByText("Dreams")).toBeInTheDocument();
    expect(within(room).getByText("Fleetwood Mac · Rumours")).toBeInTheDocument();
    expect(within(room).getByText(enPlayer.listening.earlier)).toBeInTheDocument();
    expect(within(room).getByText("Roads · Portishead")).toBeInTheDocument();
    expect(within(room).getByText("5m ago")).toBeInTheDocument();
  });

  it("says so when nobody is listening, and leaves the earlier heading out when there is no one", () => {
    renderPlayer({ listening: listening({ roomOpen: true }) });

    const room = screen.getByRole("dialog", { name: enPlayer.listening.title });
    expect(within(room).getByText(enPlayer.listening.empty)).toBeInTheDocument();
    expect(within(room).queryByText(enPlayer.listening.earlier)).not.toBeInTheDocument();
  });

  it("closes from its own button", async () => {
    const { actions, user } = renderPlayer({ listening: listening({ roomOpen: true, live: crowd(1) }) });

    await user.click(screen.getByRole("button", { name: enPlayer.listening.close }));

    expect(actions.toggleRoom).toHaveBeenCalledTimes(1);
  });

  it("counts as an open panel", () => {
    expect(panelOpen(createPlayerView())).toBe(false);
    expect(panelOpen(createPlayerView({ listening: listening({ roomOpen: true }) }))).toBe(true);
  });
});

describe("the full stage", () => {
  it("draws the avatars and a room button of its own", async () => {
    const { actions, user } = renderPlayer({ fullscreen: true, listening: listening({ live: crowd(2) }) });

    expect(screen.getByRole("button", { name: countLabel(2) })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: enPlayer.listening.title }));

    expect(actions.toggleRoom).toHaveBeenCalledTimes(1);
  });

  it("keeps the room button while nobody is listening", () => {
    renderPlayer({ fullscreen: true });

    expect(screen.getByRole("button", { name: enPlayer.listening.title })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: countLabel(1) })).not.toBeInTheDocument();
  });
});

describe("the arrival notice", () => {
  it("is not raised while nobody arrived", () => {
    renderPlayer({ listening: listening({ live: crowd(1) }) });

    expect(sonner.custom).not.toHaveBeenCalled();
  });

  it("is raised once per arrival under an id that names the member and the play", () => {
    const arrival = member({ userId: "u7", playedAt: new Date(4_000) });
    const { rerender, view, actions } = renderPlayer({ listening: listening({ live: [arrival], arrival }) });
    rerender(<Player view={{ ...view, positionSeconds: 31 }} actions={actions} />);

    expect(sonner.custom).toHaveBeenCalledTimes(1);
    expect(sonner.custom.mock.calls[0]?.[1]).toMatchObject({ id: listeningNoticeId(arrival) });
    expect(listeningNoticeId(arrival)).toBe("listening-u7-4000");
  });

  it("names the member and the track, and opens the room on a press", async () => {
    const arrival = member({ name: "Carla", title: "Teardrop", artist: "Massive Attack", album: "Mezzanine" });
    const { actions, user } = renderPlayer({ listening: listening({ live: [arrival], arrival }) });
    const draw = sonner.custom.mock.calls[0]?.[0];
    render(draw());

    expect(screen.getByText(enPlayer.listening.started.replace("{{name}}", "Carla"))).toBeInTheDocument();
    expect(screen.getByText("Teardrop")).toBeInTheDocument();
    expect(screen.getByText("Massive Attack · Mezzanine")).toBeInTheDocument();
    await user.click(screen.getByText("Teardrop"));

    expect(sonner.dismiss).toHaveBeenCalledWith(listeningNoticeId(arrival));
    expect(actions.dismissArrival).toHaveBeenCalledTimes(1);
    expect(actions.toggleRoom).toHaveBeenCalledTimes(1);
  });
});

describe("the locked scrobbling indicator", () => {
  it("says a private session holds it off and offers no press", () => {
    renderPlayer({ scrobbleLock: "private", scrobble: "off", scrobbleActionable: false });

    const locked = screen.getAllByRole("status", { name: enPlayer.scrobble.locked.private });
    expect(locked.length).toBeGreaterThan(0);
    expect(locked[0]).toHaveAttribute("data-locked", "true");
    expect(screen.queryByRole("button", { name: enPlayer.scrobble.locked.private })).not.toBeInTheDocument();
  });

  it("says the account switch holds it off", () => {
    renderPlayer({ scrobbleLock: "account", scrobble: "off", scrobbleActionable: false });

    expect(screen.getAllByRole("status", { name: enPlayer.scrobble.locked.account }).length).toBeGreaterThan(0);
  });

  it("keeps the plain off label while nothing locks it", () => {
    renderPlayer();

    const plain = screen.getAllByRole("status", { name: enPlayer.scrobble.off });
    expect(plain[0]).toHaveAttribute("data-locked", "false");
  });
});
