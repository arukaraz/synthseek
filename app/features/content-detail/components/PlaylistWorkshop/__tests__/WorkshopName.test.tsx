import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePlaylistNameDraft } from "../../../hooks/usePlaylistNameDraft";
import { WORKSHOP_NAME_SAVE_MS } from "../constants";
import { WorkshopName } from "../WorkshopName";
import { WorkshopSurface } from "../WorkshopSurface";

vi.mock("@hooks/ui/player", () => ({
  usePlayerDock: () => "hidden",
  usePlayerBottomDock: () => "hidden",
}));

function Workshop({ save, onExit }: { save: (name: string) => Promise<void>; onExit: () => void }) {
  const nameDraft = usePlaylistNameDraft("Road Trip", save);
  return (
    <WorkshopSurface open name="Road Trip" onExit={onExit}>
      <WorkshopName canRename nameDraft={nameDraft} maxChars={100} />
    </WorkshopSurface>
  );
}

function setup() {
  const save = vi.fn(async (_name: string) => undefined);
  const onExit = vi.fn();
  render(<Workshop save={save} onExit={onExit} />);
  const input = screen.getByRole("textbox");
  act(() => input.focus());
  return { save, onExit, input };
}

async function pause(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("WorkshopName", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("puts back the name the field had when Escape is pressed while typing, and keeps the workshop open", async () => {
    const { save, onExit, input } = setup();

    fireEvent.change(input, { target: { value: "Road Tr" } });
    fireEvent.keyDown(input, { key: "Escape" });
    await pause(WORKSHOP_NAME_SAVE_MS);

    expect(input).toHaveValue("Road Trip");
    expect(onExit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("saves the earlier name again when a half-typed one had already been saved", async () => {
    const { save, input } = setup();

    fireEvent.change(input, { target: { value: "Road" } });
    await pause(WORKSHOP_NAME_SAVE_MS);
    expect(save).toHaveBeenLastCalledWith("Road");

    fireEvent.keyDown(input, { key: "Escape" });
    await pause(0);

    expect(input).toHaveValue("Road Trip");
    expect(save).toHaveBeenLastCalledWith("Road Trip");
  });

  it("closes the workshop on Escape once nothing typed is waiting", async () => {
    const { onExit, input } = setup();

    fireEvent.change(input, { target: { value: "Road Tr" } });
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("still saves on Enter", async () => {
    const { save, input } = setup();

    fireEvent.change(input, { target: { value: "Night Drive" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await pause(0);

    expect(save).toHaveBeenCalledWith("Night Drive");
  });
});
