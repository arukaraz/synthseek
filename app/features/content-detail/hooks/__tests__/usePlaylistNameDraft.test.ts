import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WORKSHOP_NAME_SAVE_MS } from "../../components/PlaylistWorkshop/constants";
import { usePlaylistNameDraft } from "../usePlaylistNameDraft";

interface PendingSave {
  name: string;
  resolve: () => void;
  reject: (error: Error) => void;
}

function saver() {
  const pending: PendingSave[] = [];
  const save = vi.fn(
    (name: string) =>
      new Promise<void>((resolve, reject) => {
        pending.push({ name, resolve, reject });
      })
  );
  return { save, pending };
}

function draftOf(save: (name: string) => Promise<void>, name = "Road Trip") {
  return renderHook(({ current }) => usePlaylistNameDraft(current, save), { initialProps: { current: name } });
}

async function settle() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

async function pause(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("usePlaylistNameDraft", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows what is typed at once and saves it, trimmed, only once the typing pauses", async () => {
    const { save } = saver();
    const { result } = draftOf(save);

    act(() => result.current.change("  Night Drive"));

    expect(result.current.draft).toBe("  Night Drive");
    expect(result.current.shown).toBe("Night Drive");

    await pause(WORKSHOP_NAME_SAVE_MS - 1);
    act(() => result.current.change("  Night Drives "));
    await pause(WORKSHOP_NAME_SAVE_MS - 1);
    expect(save).not.toHaveBeenCalled();

    await pause(1);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("Night Drives");
  });

  it("saves at once when the field is left, and never sends the same name twice", async () => {
    const { save } = saver();
    const { result } = draftOf(save);

    act(() => result.current.change("Night Drive"));
    act(() => void result.current.finish());
    await settle();

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("Night Drive");

    await pause(WORKSHOP_NAME_SAVE_MS * 2);
    act(() => void result.current.finish());
    await settle();

    expect(save).toHaveBeenCalledTimes(1);
  });

  it("does not send a name that only gained spaces around it", async () => {
    const { save } = saver();
    const { result } = draftOf(save);

    act(() => result.current.change("  Road Trip  "));
    await pause(WORKSHOP_NAME_SAVE_MS);

    expect(save).not.toHaveBeenCalled();
  });

  it("keeps showing the stored name while the field is blank, never saves a blank, and refills the field on leaving", async () => {
    const { save } = saver();
    const { result } = draftOf(save);

    act(() => result.current.change("   "));

    expect(result.current.draft).toBe("   ");
    expect(result.current.shown).toBe("Road Trip");

    await pause(WORKSHOP_NAME_SAVE_MS);
    act(() => void result.current.finish());
    await settle();

    expect(save).not.toHaveBeenCalled();
    expect(result.current.draft).toBe("Road Trip");
  });

  it("sends a second name only after the first save has answered, in the order they were typed", async () => {
    const { save, pending } = saver();
    const { result } = draftOf(save);

    act(() => result.current.change("Night"));
    act(() => void result.current.finish());
    act(() => result.current.change("Night Drive"));
    act(() => void result.current.finish());
    await settle();

    expect(save.mock.calls).toEqual([["Night"]]);

    pending[0]?.resolve();
    await settle();

    expect(save.mock.calls).toEqual([["Night"], ["Night Drive"]]);
  });

  it("puts the stored name back when the save is refused, and lets the same name be tried again", async () => {
    const { save, pending } = saver();
    const { result } = draftOf(save);

    act(() => result.current.change("Night Drive"));
    act(() => void result.current.finish());
    await settle();
    expect(pending).toHaveLength(1);

    pending[0]?.reject(new Error("refused"));
    await settle();

    expect(result.current.draft).toBe("Road Trip");
    expect(result.current.shown).toBe("Road Trip");

    act(() => result.current.change("Night Drive"));
    act(() => void result.current.finish());
    await settle();

    expect(save).toHaveBeenCalledTimes(2);
  });

  it("keeps what was typed after a refused save when the user had already typed on, and saves that", async () => {
    const { save, pending } = saver();
    const { result } = draftOf(save);

    act(() => result.current.change("Night"));
    act(() => void result.current.finish());
    await settle();
    act(() => result.current.change("Night Drive"));
    pending[0]?.reject(new Error("refused"));
    await settle();

    expect(result.current.draft).toBe("Night Drive");

    await pause(WORKSHOP_NAME_SAVE_MS);

    expect(save.mock.calls).toEqual([["Night"], ["Night Drive"]]);
  });

  it("leaves the field alone when the server answers with the name just saved, spaces still being typed included", async () => {
    const { save, pending } = saver();
    const { result, rerender } = draftOf(save);

    act(() => result.current.change("Night "));
    await pause(WORKSHOP_NAME_SAVE_MS);
    rerender({ current: "Night" });
    pending[0]?.resolve();
    await settle();

    expect(result.current.draft).toBe("Night ");
    expect(result.current.shown).toBe("Night");
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("ignores a name from the server while the user is typing, and takes it once nothing is being typed", async () => {
    const { save } = saver();
    const { result, rerender } = draftOf(save);

    act(() => result.current.change("Night"));
    rerender({ current: "Renamed Elsewhere" });

    expect(result.current.draft).toBe("Night");

    const idle = draftOf(save);
    idle.rerender({ current: "Renamed Elsewhere" });

    expect(idle.result.current.draft).toBe("Renamed Elsewhere");
    expect(idle.result.current.shown).toBe("Renamed Elsewhere");

    act(() => idle.result.current.change("Renamed Elsewhere "));
    act(() => void idle.result.current.finish());
    await settle();

    expect(save).not.toHaveBeenCalled();
  });

  it("takes a name the server changed meanwhile once the typing ends with nothing to save", async () => {
    const { save } = saver();
    const { result, rerender } = draftOf(save);

    act(() => result.current.change("Road Trips"));
    rerender({ current: "Renamed Elsewhere" });
    act(() => result.current.change("Road Trip"));
    act(() => void result.current.finish());
    await settle();

    expect(save).not.toHaveBeenCalled();
    expect(result.current.draft).toBe("Renamed Elsewhere");
    expect(result.current.shown).toBe("Renamed Elsewhere");
  });

  it("saves a name still waiting when the workshop goes away", async () => {
    const { save } = saver();
    const { result, unmount } = draftOf(save);

    act(() => result.current.change("Night Drive"));
    unmount();
    await settle();

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("Night Drive");
  });

  it("sends nothing when the workshop goes away with nothing waiting", async () => {
    const { save } = saver();
    const { unmount } = draftOf(save);

    unmount();
    await settle();

    expect(save).not.toHaveBeenCalled();
  });

  it("tells a caller that waits when the name has been saved, and at once when nothing was waiting", async () => {
    const { save, pending } = saver();
    const { result } = draftOf(save);
    const idle = vi.fn();
    const saved = vi.fn();

    await act(async () => {
      await result.current.commit().then(idle);
    });
    expect(idle).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveBeenCalled();

    act(() => result.current.change("Night Drive"));
    act(() => void result.current.commit().then(saved));
    await settle();

    expect(save).toHaveBeenCalledWith("Night Drive");
    expect(saved).not.toHaveBeenCalled();

    pending[0]?.resolve();
    await settle();

    expect(saved).toHaveBeenCalledTimes(1);
  });
});
