import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSettings from "@modules/i18n/messages/en/settings.json";

const player = vi.hoisted(() => ({ pauseHere: vi.fn() }));

vi.mock("@hooks/ui/player", () => ({ playerActions: { pauseHere: player.pauseHere } }));

import { CopyRow } from "../CopyRow";
import type { CopyRowProps } from "../types";

let playResult: Promise<void> = Promise.resolve();

function copy(overrides: Partial<CopyRowProps["copy"]> = {}): CopyRowProps["copy"] {
  return {
    id: "file-1",
    fileName: "01 - Digital Love.flac",
    sizeBytes: 31_457_280,
    durationSeconds: 301,
    serving: false,
    ...overrides,
  };
}

function renderRow(overrides: Partial<CopyRowProps> = {}) {
  const props: CopyRowProps = {
    copy: copy(),
    disabled: false,
    keeping: false,
    playing: false,
    onPlayChange: vi.fn(),
    onKeep: vi.fn(),
    ...overrides,
  };
  const result = render(<CopyRow {...props} />);
  const audio = result.container.querySelector("audio");
  if (!(audio instanceof HTMLAudioElement)) throw new Error("the row rendered no audio element");
  return { ...result, props, audio, user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  playResult = Promise.resolve();
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    writable: true,
    value: vi.fn(() => playResult),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
});

describe("what the row shows about a copy", () => {
  it("names the file, its length and its size", () => {
    renderRow();

    expect(screen.getByText("01 - Digital Love.flac")).toBeInTheDocument();
    expect(screen.getByText("5:01")).toBeInTheDocument();
    expect(screen.getByText("30.0 MB")).toBeInTheDocument();
  });

  it("says nothing about the length of a copy whose length is unknown", () => {
    renderRow({ copy: copy({ durationSeconds: null }) });

    expect(screen.queryByText("5:01")).not.toBeInTheDocument();
  });

  it("marks the copy the library actually serves", () => {
    renderRow({ copy: copy({ serving: true }) });

    expect(screen.getByText(enSettings.libraryScan.duplicates.inLibrary)).toBeInTheDocument();
  });

  it("points the preview at the file the row is about", () => {
    const { audio } = renderRow();

    expect(audio.getAttribute("src")).toContain("file-1");
    expect(audio.getAttribute("preload")).toBe("none");
  });
});

describe("previewing a copy", () => {
  it("asks the parent to start this copy, since only one may sound at a time", async () => {
    const { props, user } = renderRow();

    await user.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.play }));

    expect(props.onPlayChange).toHaveBeenCalledWith("file-1");
  });

  it("asks the parent to stop when it is the one sounding", async () => {
    const { props, audio, user } = renderRow({ playing: true });
    audio.dispatchEvent(new Event("playing"));
    const pause = await screen.findByRole("button", { name: enSettings.libraryScan.duplicates.pause });

    await user.click(pause);

    expect(props.onPlayChange).toHaveBeenCalledWith(null);
  });

  it("shows it is fetching before the first sound comes out", () => {
    renderRow({ playing: true });

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.loading })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("stops showing the spinner once the copy is sounding", async () => {
    const { audio, user } = renderRow({ playing: true });

    await user.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.loading }));
    audio.dispatchEvent(new Event("playing"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.pause })).toBeInTheDocument()
    );
  });

  it("shows the spinner again while the stream refills", async () => {
    const { audio } = renderRow({ playing: true });
    audio.dispatchEvent(new Event("playing"));

    audio.dispatchEvent(new Event("waiting"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.loading })).toBeInTheDocument()
    );
  });

  it("silences the main player, so the preview is not heard over a track", () => {
    const { audio } = renderRow();

    audio.dispatchEvent(new Event("play"));

    expect(player.pauseHere).toHaveBeenCalled();
  });

  it("tells the parent the preview reached its end", () => {
    const { props, audio } = renderRow({ playing: true });

    audio.dispatchEvent(new Event("ended"));

    expect(props.onPlayChange).toHaveBeenCalledWith(null);
  });

  it("gives up rather than spinning forever when the file cannot be played", async () => {
    const { props, audio } = renderRow({ playing: true });

    audio.dispatchEvent(new Event("error"));

    await waitFor(() => expect(props.onPlayChange).toHaveBeenCalledWith(null));
  });

  it("gives up when the browser refuses to start the preview at all", async () => {
    playResult = Promise.reject(new Error("NotAllowedError"));
    const { props } = renderRow({ playing: true });

    await waitFor(() => expect(props.onPlayChange).toHaveBeenCalledWith(null));
  });

  it("stops the preview when the row goes away", () => {
    const { unmount, audio } = renderRow({ playing: true });

    unmount();

    expect(audio.pause).toHaveBeenCalled();
  });
});

describe("keeping a copy", () => {
  it("keeps the copy the listener chose", async () => {
    const { props, user } = renderRow();

    await user.click(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.keepThis }));

    expect(props.onKeep).toHaveBeenCalled();
  });

  it("is out of reach while another reclaim is running", () => {
    renderRow({ disabled: true });

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.keepThis })).toBeDisabled();
  });

  it("is out of reach while this very copy is being kept", () => {
    renderRow({ keeping: true });

    expect(screen.getByRole("button", { name: enSettings.libraryScan.duplicates.keepThis })).toBeDisabled();
  });
});
