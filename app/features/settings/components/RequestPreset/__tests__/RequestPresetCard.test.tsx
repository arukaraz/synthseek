import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestPreset } from "@features/search/components/ConfigRequestModal/types";
import { renderWithProviders, screen } from "@test/test-utils";

import { RequestPresetCard } from "../RequestPresetCard";

const SOURCE = { enabled: true, allowsSingleTracks: true };

vi.mock("@hooks/api", () => ({
  useDownloadSourcesAvailability: () => ({
    data: {
      slskd: SOURCE,
      ytdlp: SOURCE,
      usenet: { enabled: false, allowsSingleTracks: false },
      archive: { enabled: false, allowsSingleTracks: true },
      soundcloud: { enabled: false, allowsSingleTracks: true },
      subsonic: { enabled: false, allowsSingleTracks: true },
      torrent: { enabled: false, allowsSingleTracks: false },
    },
  }),
}));

const SEED: RequestPreset = {
  bitrate: { value: 320, matching: "flexible" },
  format: { value: "mp3", matching: "flexible" },
  minUploadSpeed: 0,
  requireFreeSlot: false,
};

const onSave = vi.fn();

function renderCard(own: RequestPreset | null) {
  return renderWithProviders(
    <RequestPresetCard
      title="Your request preset"
      description="What the left half uses"
      anchor="requestPreset"
      own={own}
      seed={SEED}
      followLabel="Follow the server"
      customLabel="My own"
      followSummary="Your requests follow the server preset."
      onSave={onSave}
    />
  );
}

beforeEach(() => {
  onSave.mockReset();
  onSave.mockResolvedValue(null);
});

describe("RequestPresetCard", () => {
  it("shows what a user without a preset follows, and nothing to save", () => {
    renderCard(null);

    expect(screen.getByRole("radio", { name: "Follow the server" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Your requests follow the server preset.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
  });

  it("saves a preset of their own, starting from the seed", async () => {
    const { user } = renderCard(null);

    await user.click(screen.getByRole("radio", { name: "My own" }));
    await user.click(screen.getByRole("button", { name: /^FLAC/ }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSave).toHaveBeenCalledWith({ ...SEED, format: { value: "flac", matching: "flexible" } });
  });

  it("clears the preset when the user goes back to following", async () => {
    const { user } = renderCard({ ...SEED, minUploadSpeed: 50 });

    expect(screen.getByRole("radio", { name: "My own" })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: "Follow the server" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSave).toHaveBeenCalledWith(null);
  });
});
