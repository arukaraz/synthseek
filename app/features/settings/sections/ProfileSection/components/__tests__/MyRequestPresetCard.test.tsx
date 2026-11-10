import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestPreset, RequestPresetOrigin } from "@features/search/components/ConfigRequestModal/types";
import { renderWithProviders, screen } from "@test/test-utils";

import { MyRequestPresetCard } from "../MyRequestPresetCard";

const FACTORY: RequestPreset = {
  bitrate: { value: 320, matching: "flexible" },
  format: { value: "mp3", matching: "flexible" },
  minUploadSpeed: 0,
  requireFreeSlot: false,
};

const SERVER: RequestPreset = { ...FACTORY, format: { value: "flac", matching: "strict" } };

interface MineView {
  own: RequestPreset | null;
  server: RequestPreset | null;
  effective: { preset: RequestPreset; origin: RequestPresetOrigin };
  factory: RequestPreset;
  canEdit: boolean;
}

const state = vi.hoisted(() => {
  const mine: { current: MineView | undefined } = { current: undefined };
  return { mine, save: vi.fn(), failed: { current: false } };
});

vi.mock("@hooks/api", () => ({
  useMyRequestPreset: () => ({ data: state.mine.current, isError: state.failed.current }),
  useSetMyRequestPreset: () => ({ mutateAsync: state.save }),
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

function mine(overrides: Partial<MineView>): MineView {
  return {
    own: null,
    server: SERVER,
    effective: { preset: SERVER, origin: "server" },
    factory: FACTORY,
    canEdit: true,
    ...overrides,
  };
}

beforeEach(() => {
  state.save.mockReset();
  state.mine.current = undefined;
  state.failed.current = false;
});

describe("MyRequestPresetCard", () => {
  it("renders nothing until the preset loads", () => {
    const { container } = renderWithProviders(<MyRequestPresetCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps its card and says so when the preset cannot be loaded", () => {
    state.failed.current = true;
    renderWithProviders(<MyRequestPresetCard />);
    expect(screen.getByText("The request preset could not be loaded. Try again later.")).toBeInTheDocument();
  });

  it("shows a member their own preset read only, with no way to change it", () => {
    state.mine.current = mine({ canEdit: false, effective: { preset: SERVER, origin: "user" } });
    renderWithProviders(<MyRequestPresetCard />);

    expect(screen.getByText(/Your account has its own preset: Lossless \(Strict\)/)).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("tells a member when they follow the server preset", () => {
    state.mine.current = mine({ canEdit: false });
    renderWithProviders(<MyRequestPresetCard />);

    expect(screen.getByText(/You use the server preset/)).toBeInTheDocument();
  });

  it("tells a member their last request's settings apply when there is no preset", () => {
    state.mine.current = mine({ canEdit: false, server: null, effective: { preset: FACTORY, origin: "last" } });
    renderWithProviders(<MyRequestPresetCard />);

    expect(screen.getByText(/You use the settings of your last request: MP3 320 kbps/)).toBeInTheDocument();
  });

  it("tells a member when there is no preset and no earlier request", () => {
    state.mine.current = mine({ canEdit: false, server: null, effective: { preset: FACTORY, origin: "factory" } });
    renderWithProviders(<MyRequestPresetCard />);

    expect(screen.getByText(/You use the default settings: MP3 320 kbps/)).toBeInTheDocument();
  });

  it("lets a trusted user follow the server preset it names", () => {
    state.mine.current = mine({});
    renderWithProviders(<MyRequestPresetCard />);

    expect(screen.getByRole("radio", { name: "Follow the server" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Your requests follow the server preset: Lossless (Strict) · Auto.")).toBeInTheDocument();
  });

  it("says what following means when the server has no preset", () => {
    state.mine.current = mine({ server: null });
    renderWithProviders(<MyRequestPresetCard />);

    expect(screen.getByText(/There is no server preset/)).toBeInTheDocument();
  });

  it("saves the user's own preset", async () => {
    state.mine.current = mine({});
    state.save.mockResolvedValue(null);
    const { user } = renderWithProviders(<MyRequestPresetCard />);

    await user.click(screen.getByRole("radio", { name: "My own" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(state.save).toHaveBeenCalledWith({ preset: SERVER });
  });
});
