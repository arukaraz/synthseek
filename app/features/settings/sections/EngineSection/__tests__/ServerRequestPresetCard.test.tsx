import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestPreset } from "@features/search/components/ConfigRequestModal/types";
import { renderWithProviders, screen } from "@test/test-utils";

import { ServerRequestPresetCard } from "../ServerRequestPresetCard";

const FACTORY: RequestPreset = {
  bitrate: { value: 320, matching: "flexible" },
  format: { value: "mp3", matching: "flexible" },
  minUploadSpeed: 0,
  requireFreeSlot: false,
};

const state = vi.hoisted(() => {
  const server: { current: RequestPreset | null } = { current: null };
  return { server, save: vi.fn(), loaded: { current: true }, failed: { current: false } };
});

vi.mock("@hooks/api", () => ({
  useMyRequestPreset: () => ({
    data: state.loaded.current ? { server: state.server.current, factory: FACTORY } : undefined,
    isError: state.failed.current,
  }),
  useSetServerRequestPreset: () => ({ mutateAsync: state.save }),
  useDownloadSourcesAvailability: () => ({
    data: {
      slskd: { enabled: true, allowsSingleTracks: true },
      ytdlp: { enabled: false, allowsSingleTracks: true },
      usenet: { enabled: false, allowsSingleTracks: false },
      archive: { enabled: false, allowsSingleTracks: true },
      soundcloud: { enabled: false, allowsSingleTracks: true },
      subsonic: { enabled: false, allowsSingleTracks: true },
      torrent: { enabled: false, allowsSingleTracks: false },
    },
  }),
}));

beforeEach(() => {
  state.save.mockReset();
  state.save.mockResolvedValue(null);
  state.server.current = null;
  state.loaded.current = true;
  state.failed.current = false;
});

describe("ServerRequestPresetCard", () => {
  it("renders nothing until the presets load", () => {
    state.loaded.current = false;
    const { container } = renderWithProviders(<ServerRequestPresetCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps its card and says so when the presets cannot be loaded", () => {
    state.loaded.current = false;
    state.failed.current = true;
    renderWithProviders(<ServerRequestPresetCard />);
    expect(screen.getByText("The request preset could not be loaded. Try again later.")).toBeInTheDocument();
  });

  it("names the factory defaults a server without a preset falls back to", () => {
    renderWithProviders(<ServerRequestPresetCard />);

    expect(screen.getByRole("radio", { name: "Factory defaults" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/factory defaults \(MP3 320 kbps \(Flexible\) · Auto\)/)).toBeInTheDocument();
  });

  it("saves the server preset starting from the factory defaults", async () => {
    const { user } = renderWithProviders(<ServerRequestPresetCard />);

    await user.click(screen.getByRole("radio", { name: "Server preset" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(state.save).toHaveBeenCalledWith({ preset: FACTORY });
  });
});
