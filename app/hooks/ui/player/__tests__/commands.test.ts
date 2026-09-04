import { beforeEach, describe, expect, it, vi } from "vitest";

import { SubscriptionEventType } from "@api/__generated__/types";

const store = vi.hoisted(() => ({
  actions: { resumeHere: vi.fn(), pauseHere: vi.fn(), togglePlay: vi.fn() },
}));
const device = vi.hoisted(() => ({ deviceIdentity: vi.fn(() => ({ id: "mine", name: "Chrome on Linux" })) }));

vi.mock("../store", () => store);
vi.mock("../device", () => device);

import { applyPlayerCommand, setTakeOverHandler } from "../commands";

function command(overrides: Partial<Parameters<typeof applyPlayerCommand>[0]>) {
  return {
    eventType: SubscriptionEventType.PlayerCommand,
    userId: "u1",
    deviceId: "mine",
    issuedAt: Date.now(),
    command: "pause" as const,
    ...overrides,
  };
}

beforeEach(() => {
  for (const fn of Object.values(store.actions)) fn.mockReset();
  setTakeOverHandler(null);
});

describe("applyPlayerCommand", () => {
  it("ignores a command addressed to another device", () => {
    applyPlayerCommand(command({ deviceId: "somebody-else" }));

    expect(store.actions.pauseHere).not.toHaveBeenCalled();
  });

  it("pauses on pause and resumes on play, rather than toggling either way", () => {
    applyPlayerCommand(command({ command: "pause", issuedAt: 1_000 }));
    applyPlayerCommand(command({ command: "play", issuedAt: 2_000 }));

    expect(store.actions.pauseHere).toHaveBeenCalledTimes(1);
    expect(store.actions.resumeHere).toHaveBeenCalledTimes(1);
    expect(store.actions.togglePlay).not.toHaveBeenCalled();
  });

  it("acts on two identical commands in a row, because each is a separate press", () => {
    applyPlayerCommand(command({ command: "pause", issuedAt: 3_000 }));
    applyPlayerCommand(command({ command: "pause", issuedAt: 4_000 }));

    expect(store.actions.pauseHere).toHaveBeenCalledTimes(2);
  });

  it("drops a command that arrives out of order", () => {
    applyPlayerCommand(command({ command: "pause", issuedAt: 9_000 }));
    applyPlayerCommand(command({ command: "play", issuedAt: 8_000 }));

    expect(store.actions.resumeHere).not.toHaveBeenCalled();
  });

  it("hands a take-over to whoever registered for it, and stops when nobody has", () => {
    const takeOver = vi.fn();
    setTakeOverHandler(takeOver);
    applyPlayerCommand(command({ command: "handOver", issuedAt: 10_000 }));
    expect(takeOver).toHaveBeenCalledTimes(1);

    setTakeOverHandler(null);
    applyPlayerCommand(command({ command: "handOver", issuedAt: 11_000 }));
    expect(takeOver).toHaveBeenCalledTimes(1);
  });
});
