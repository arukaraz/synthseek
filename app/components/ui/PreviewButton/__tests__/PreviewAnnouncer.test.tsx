import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FakeAudio } from "@test/mocks/audio.mock";
import { renderWithProviders, screen } from "@test/test-utils";

vi.mock("@hooks/ui/player", () => ({
  playerActions: { pauseHere: vi.fn(), resumeHere: vi.fn() },
  playerSnapshot: () => ({ playing: false, volume: 1, muted: false, remote: null }),
  subscribePlayer: () => () => undefined,
}));

import { catalogPreviewClip, fileAuditionClip } from "@hooks/ui/trackPreview";
import { resetTrackPreview, togglePreview } from "@hooks/ui/trackPreview/store";

import { PreviewAnnouncer } from "../PreviewAnnouncer";
import { PreviewButton } from "../PreviewButton";

beforeEach(() => {
  FakeAudio.reset();
  vi.stubGlobal("Audio", FakeAudio);
});

afterEach(() => {
  act(() => resetTrackPreview());
  vi.unstubAllGlobals();
});

function announced(): HTMLElement {
  return screen.getByRole("status");
}

describe("PreviewAnnouncer", () => {
  it("announces a catalog sample as the preview", () => {
    renderWithProviders(<PreviewAnnouncer />);

    act(() => {
      togglePreview(catalogPreviewClip("3135556", "Pretending"));
      FakeAudio.only().emit("playing");
    });

    expect(announced()).toHaveTextContent("Playing the preview of Pretending.");
  });

  it("announces the file under review as the file, from start to failure", () => {
    renderWithProviders(<PreviewAnnouncer />);

    act(() => {
      togglePreview(fileAuditionClip("copy-1", "Pretending", 242));
      FakeAudio.only().emit("playing");
    });
    expect(announced()).toHaveTextContent("Playing the file Pretending.");

    act(() => FakeAudio.only().emit("error"));
    expect(announced()).toHaveTextContent("Couldn't load the file Pretending.");
  });
});

describe("PreviewButton for a file", () => {
  it("names the file, not a preview, once it failed to load", async () => {
    const { user } = renderWithProviders(
      <PreviewButton title="Pretending" subject="file" status="error" clock={null} available onToggle={vi.fn()} />
    );

    const failed = screen.getByRole("button", { name: "File unavailable: Pretending" });
    await user.hover(failed);

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Couldn't load the file.");
  });
});
