import { SubscriptionEventType, type PlexSyncAllProgressPayload } from "@api/__generated__/types";
import { handlePlexSyncAllProgress } from "@hooks/api/subscriptions/handlers/requests/plexSyncAllProgress";
import { resetDockStore, seedPlexSyncDockJob } from "@hooks/api/subscriptions/shared/progressDock";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProgressDock } from "../ProgressDock";

const spies = vi.hoisted(() => ({ setData: vi.fn(), invalidate: vi.fn(), invalidateItems: vi.fn() }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getPlexSyncAllState: { setData: spies.setData },
        getPlexSyncAllItems: { invalidate: spies.invalidateItems },
        getAll: { invalidate: spies.invalidate },
      },
    }),
  },
}));

function progressEvent(current: { id: string; ok: boolean }, synced: number): PlexSyncAllProgressPayload {
  return {
    eventType: SubscriptionEventType.PlexSyncAllProgress,
    phase: "progress",
    synced,
    total: 3,
    current,
  };
}

function stateOf(name: string): string {
  const row = screen.getByText(name).closest("li");
  if (!row) throw new Error(`No dock row rendered for ${name}`);
  const state = row.querySelector("span.sr-only");
  if (!state) throw new Error(`Dock row for ${name} renders no state label`);
  return state.textContent ?? "";
}

beforeEach(() => {
  resetDockStore();
  spies.setData.mockReset();
  spies.invalidate.mockReset();
});

afterEach(() => {
  resetDockStore();
  vi.clearAllMocks();
});

describe("ProgressDock, Plex sync-all late join", () => {
  it("renders the real playlist names and the outcome each row already reached", () => {
    seedPlexSyncDockJob([
      { id: "pl_a", name: "Road Trip", state: "done" },
      { id: "pl_b", name: "Focus", state: "pending" },
      { id: "pl_c", name: "Chill", state: "pending" },
    ]);

    render(<ProgressDock />);

    expect(stateOf("Road Trip")).toBe("Done");
    expect(stateOf("Focus")).toBe("Pending");
    expect(stateOf("Chill")).toBe("Pending");
  });

  it("advances a rehydrated row when a progress event names that playlist", () => {
    seedPlexSyncDockJob([
      { id: "pl_a", name: "Road Trip", state: "done" },
      { id: "pl_b", name: "Focus", state: "pending" },
      { id: "pl_c", name: "Chill", state: "pending" },
    ]);
    render(<ProgressDock />);

    const utils = {
      requests: {
        getPlexSyncAllState: { setData: spies.setData },
        getPlexSyncAllItems: { invalidate: spies.invalidateItems },
        getAll: { invalidate: spies.invalidate },
      },
    };
    act(() => {
      handlePlexSyncAllProgress(progressEvent({ id: "pl_b", ok: true }, 2), utils);
    });

    expect(stateOf("Focus")).toBe("Done");

    act(() => {
      handlePlexSyncAllProgress(progressEvent({ id: "pl_c", ok: false }, 2), utils);
    });

    expect(stateOf("Chill")).toBe("Failed");
    expect(stateOf("Road Trip")).toBe("Done");
  });
});
