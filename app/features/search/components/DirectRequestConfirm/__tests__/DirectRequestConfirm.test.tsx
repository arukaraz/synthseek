import { describe, expect, it, vi } from "vitest";

import { createMusicPlaylist, createMusicTrack } from "@test/factories";
import { renderWithProviders, screen } from "@test/test-utils";

import { DirectRequestConfirm } from "../DirectRequestConfirm";

const playlist = createMusicPlaylist({ name: "Trip-hop" });
const tracks = [createMusicTrack({ id: "a" }), createMusicTrack({ id: "b" }), createMusicTrack({ id: "c" })];

describe("DirectRequestConfirm", () => {
  it("stays closed with nothing pending", () => {
    renderWithProviders(<DirectRequestConfirm pending={null} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("says how many tracks it will send and sends them on confirm", async () => {
    const onConfirm = vi.fn();
    const { user } = renderWithProviders(
      <DirectRequestConfirm
        pending={{ target: { item: playlist, mode: "download" }, tracks, name: "Trip-hop" }}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("Request Trip-hop?")).toBeInTheDocument();
    expect(screen.getByText("This sends 3 tracks with your request preset.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Request 3 tracks" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cancels without sending", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { user } = renderWithProviders(
      <DirectRequestConfirm
        pending={{ target: { item: playlist, mode: "download" }, tracks, name: "Trip-hop" }}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
