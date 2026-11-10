import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { createMockTrackFull, createMockAlbumSimplified } from "@test/factories";
import { createMockUser } from "@test/mocks/feature-hooks.mock";
import { mockRouter } from "@test/mocks/next.mock";

import type { DestinationPreview, DestinationRequest, DownloadSourcesAvailability, RequestPreset } from "../types";

const MP3_320: RequestPreset = {
  bitrate: { value: 320, matching: "flexible" },
  format: { value: "mp3", matching: "flexible" },
  minUploadSpeed: 0,
  requireFreeSlot: false,
};

const LOSSLESS_PEERS: RequestPreset = {
  bitrate: { value: 256, matching: "strict" },
  format: { value: "flac", matching: "strict" },
  minUploadSpeed: 50,
  requireFreeSlot: true,
  sourceChain: ["ytdlp", "slskd"],
};

const mocks = vi.hoisted(() => ({
  requestMutate: vi.fn(),
  batchMutate: vi.fn(),
  playlistMutate: vi.fn(),
  tracksMutate: vi.fn(),
  delegateMutate: vi.fn(),
  toastError: vi.fn(),
}));

const { requestMutate, batchMutate, playlistMutate, tracksMutate, delegateMutate, toastError } = mocks;

let sourcesAvailability: DownloadSourcesAvailability | undefined;
let sourcesPending: boolean;
let effectivePreset: RequestPreset | undefined;
let presetFailed: boolean;
let isAdmin: boolean;
let role: "admin" | "trusted" | "member";
let destinationPreview: DestinationPreview | undefined;
let destinationRefreshing: boolean;
const destinationQuery = vi.fn();
let lidarrAvailable: { available: boolean } | undefined;
let contentResponse: { success: boolean; content: unknown } | undefined;
let isLoadingTracks: boolean;
let pendingFlags: {
  request: boolean;
  batch: boolean;
  playlist: boolean;
  tracks: boolean;
  delegate: boolean;
};

vi.mock("@hooks/api", () => ({
  useDownloadSourcesAvailability: () => ({ data: sourcesAvailability, isPending: sourcesPending }),
  useMyRequestPreset: () => ({
    data: effectivePreset === undefined ? undefined : { effective: { preset: effectivePreset, origin: "server" } },
    isError: presetFailed,
  }),
  useLidarrAvailable: () => ({ data: lidarrAvailable }),
  useLidarrProfiles: () => ({ data: undefined }),
  useGetContents: () => ({ data: contentResponse, isLoading: isLoadingTracks }),
  useRequest: () => ({ mutate: mocks.requestMutate, isPending: pendingFlags.request }),
  useBatchRequest: () => ({ mutate: mocks.batchMutate, isPending: pendingFlags.batch }),
  usePlaylistRequest: () => ({ mutate: mocks.playlistMutate, isPending: pendingFlags.playlist }),
  useRequestTracks: () => ({ mutate: mocks.tracksMutate, isPending: pendingFlags.tracks }),
  useDelegateArtist: () => ({ mutate: mocks.delegateMutate, isPending: pendingFlags.delegate }),
  useLibraryDestination: (input: DestinationRequest | null) => {
    destinationQuery(input);
    return { data: input === null ? undefined : destinationPreview, isPlaceholderData: destinationRefreshing };
  },
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin, currentUser: createMockUser({ role }), isLoading: false }),
}));

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError },
}));

vi.mock("../ConfigHeader", () => ({
  ConfigHeader: (props: { name: string }) => <div data-testid="config-header">{props.name}</div>,
}));

vi.mock("../LidarrInputs", () => ({
  LidarrInputs: (props: { monitorMode: string }) => <div data-testid="lidarr-inputs" data-mode={props.monitorMode} />,
}));

import { ContentType } from "@api/__generated__/types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfigRequestModal } from "../ConfigRequestModal";

function confirmButton(): HTMLElement {
  const button = document.querySelector<HTMLElement>('[data-cy="confirm-download-btn"]');
  if (!button) throw new Error("confirm button not found");
  return button;
}

function recipeRows(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-cy="request-preset-rows"]');
}

function row(label: string): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`^${label}`) });
}

function closeButton(): HTMLElement {
  return screen.getByRole("button", { name: "Close" });
}

function makeTrack() {
  return {
    ...createMockTrackFull({ id: "t1", title: "Track One", name: "Track One" }),
    type: ContentType.enum.track,
  };
}

function makeAlbum() {
  return {
    ...createMockAlbumSimplified({ id: "al1", name: "Album One" }),
    type: ContentType.enum.album,
    artist: "Album Artist",
    artists: [{ id: "a1", name: "Album Artist" }],
    genres: ["rock"],
  };
}

function makePlaylist() {
  return {
    id: "pl1",
    type: ContentType.enum.playlist,
    name: "Playlist One",
    description: "desc",
    owner: { id: "u1", name: "Owner" },
    images: [{ url: "https://img", height: 100, width: 100 }],
    total_tracks: 1,
  };
}

function makeArtist() {
  return {
    id: "ar1",
    type: ContentType.enum.artist,
    name: "Artist One",
    images: [{ url: "https://img", height: 100, width: 100 }],
  };
}

describe("ConfigRequestModal", () => {
  beforeEach(() => {
    sourcesAvailability = {
      slskd: { enabled: true, allowsSingleTracks: true },
      ytdlp: { enabled: true, allowsSingleTracks: true },
      usenet: { enabled: false, allowsSingleTracks: false },
      archive: { enabled: false, allowsSingleTracks: true },
      soundcloud: { enabled: false, allowsSingleTracks: true },
      subsonic: { enabled: false, allowsSingleTracks: true },
      torrent: { enabled: false, allowsSingleTracks: false },
    };
    sourcesPending = false;
    lidarrAvailable = { available: false };
    effectivePreset = MP3_320;
    presetFailed = false;
    isAdmin = false;
    role = "trusted";
    destinationPreview = undefined;
    destinationRefreshing = false;
    contentResponse = { success: true, content: [makeTrack()] };
    isLoadingTracks = false;
    pendingFlags = { request: false, batch: false, playlist: false, tracks: false, delegate: false };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when there is no item", () => {
    const { container } = render(
      <ConfigRequestModal isOpen onClose={vi.fn()} item={null} itemType={ContentType.enum.track} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the preset as one closed row per setting, each with its value", () => {
    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

    expect(screen.getByTestId("config-header")).toBeInTheDocument();
    expect(screen.getByText("Your preset")).toBeInTheDocument();
    expect(screen.getByText("Server preset")).toBeInTheDocument();
    expect(row("Source")).toHaveTextContent("Auto");
    expect(row("Quality")).toHaveTextContent("MP3 320 kbps");
    expect(row("Matching")).toHaveTextContent("Flexible");
    expect(row("Peers")).toHaveTextContent("Any · Any peer");
    expect(row("Source")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.getByText("MP3 320 kbps · Auto")).toBeInTheDocument();
    expect(screen.getByText("Same as a direct Request")).toBeInTheDocument();
  });

  it("opens one row at a time", async () => {
    const user = userEvent.setup();
    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

    await user.click(row("Source"));
    expect(row("Source")).toHaveAttribute("aria-expanded", "true");

    await user.click(row("Quality"));
    expect(row("Source")).toHaveAttribute("aria-expanded", "false");
    expect(row("Quality")).toHaveAttribute("aria-expanded", "true");
  });

  it("leaves an album-only source out of a track request", async () => {
    const user = userEvent.setup();
    sourcesAvailability = {
      slskd: { enabled: true, allowsSingleTracks: true },
      ytdlp: { enabled: true, allowsSingleTracks: true },
      usenet: { enabled: true, allowsSingleTracks: false },
      archive: { enabled: false, allowsSingleTracks: true },
      soundcloud: { enabled: false, allowsSingleTracks: true },
      subsonic: { enabled: false, allowsSingleTracks: true },
      torrent: { enabled: false, allowsSingleTracks: false },
    };

    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);
    await user.click(row("Source"));

    expect(screen.getByText("Uses the configured source order: Slskd → YouTube.")).toBeInTheDocument();
  });

  it("offers an album-only source for an album request", async () => {
    const user = userEvent.setup();
    sourcesAvailability = {
      slskd: { enabled: true, allowsSingleTracks: true },
      ytdlp: { enabled: true, allowsSingleTracks: true },
      usenet: { enabled: true, allowsSingleTracks: false },
      archive: { enabled: false, allowsSingleTracks: true },
      soundcloud: { enabled: false, allowsSingleTracks: true },
      subsonic: { enabled: false, allowsSingleTracks: true },
      torrent: { enabled: false, allowsSingleTracks: false },
    };

    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);
    await user.click(row("Source"));

    expect(screen.getByText("Uses the configured source order: Slskd → Usenet → YouTube.")).toBeInTheDocument();
  });

  it("fires the track mutation without per-call dock callbacks and closes immediately", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfigRequestModal
        isOpen
        onClose={onClose}
        item={makeTrack()}
        itemType={ContentType.enum.track}
        onSuccess={onSuccess}
      />
    );

    await user.click(confirmButton());

    expect(requestMutate).toHaveBeenCalledTimes(1);
    expect(requestMutate.mock.calls[0][1]).toBeUndefined();
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits an album batch download", async () => {
    const user = userEvent.setup();
    contentResponse = { success: true, content: [makeTrack()] };

    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);

    await user.click(confirmButton());

    expect(batchMutate).toHaveBeenCalledTimes(1);
    expect(batchMutate.mock.calls[0][0].external_id).toBe("al1");
    expect(batchMutate.mock.calls[0][1]).toBeUndefined();
  });

  describe("overriding the preset", () => {
    it("marks a changed row, counts it, and puts it back on Back to preset", async () => {
      const user = userEvent.setup();
      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

      await user.click(row("Quality"));
      await user.click(screen.getByRole("radio", { name: "Lossless" }));

      expect(screen.getByText("1 change to your preset")).toBeInTheDocument();
      expect(row("Quality")).toHaveTextContent("Lossless (Strict)");
      expect(row("Quality")).toHaveAccessibleName(/Changed/);
      expect(screen.queryByRole("button", { name: /^Matching/ })).not.toBeInTheDocument();
      expect(screen.getByText("Only for this request")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Back to preset" }));

      expect(screen.getByText("Your preset")).toBeInTheDocument();
      expect(row("Quality")).toHaveTextContent("MP3 320 kbps");
      expect(screen.getByText("Same as a direct Request")).toBeInTheDocument();

      await user.click(confirmButton());
      expect(requestMutate.mock.calls[0][0].config).toEqual(MP3_320);
    });

    it("sends an override for this request and puts every row back on Restore all", async () => {
      const user = userEvent.setup();
      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

      await user.click(row("Quality"));
      await user.click(screen.getByRole("radio", { name: "256" }));
      await user.click(row("Peers"));
      await user.click(screen.getByRole("radio", { name: "Available now" }));

      expect(screen.getByText("2 changes to your preset")).toBeInTheDocument();
      expect(screen.getByText("MP3 256 kbps · Auto")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Restore all" }));

      expect(screen.getByText("Your preset")).toBeInTheDocument();
      await user.click(confirmButton());
      expect(requestMutate.mock.calls[0][0].config).toEqual(MP3_320);
    });

    it("sends the override itself when the user keeps it", async () => {
      const user = userEvent.setup();
      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

      await user.click(row("Quality"));
      await user.click(screen.getByRole("radio", { name: "256" }));
      await user.click(screen.getByRole("radio", { name: "AAC" }));
      await user.click(confirmButton());

      expect(requestMutate.mock.calls[0][0].config).toEqual({
        ...MP3_320,
        bitrate: { value: 256, matching: "flexible" },
        format: { value: "aac", matching: "flexible" },
      });
    });

    it("turns Lossless off with its reason, and drops the matching and peer rows, once Slskd leaves the chain", async () => {
      const user = userEvent.setup();
      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

      await user.click(row("Source"));
      await user.click(screen.getByRole("radio", { name: "Choose order" }));
      await user.click(screen.getByRole("checkbox", { name: "Use Slskd" }));

      expect(row("Source")).toHaveTextContent("YouTube");
      expect(screen.queryByRole("button", { name: /^Matching/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^Peers/ })).not.toBeInTheDocument();

      await user.click(row("Quality"));
      expect(screen.getByRole("radio", { name: "Lossless" })).toBeDisabled();
      expect(screen.getByText("Lossless needs Slskd in the source chain.")).toBeInTheDocument();

      await user.click(confirmButton());
      expect(requestMutate.mock.calls[0][0].config.sourceChain).toEqual(["ytdlp"]);
    });
  });

  it("offers neither Lossless nor the peer row on Auto when Slskd is not among the sources", async () => {
    const user = userEvent.setup();
    sourcesAvailability = {
      slskd: { enabled: false, allowsSingleTracks: true },
      ytdlp: { enabled: true, allowsSingleTracks: true },
      usenet: { enabled: false, allowsSingleTracks: false },
      archive: { enabled: false, allowsSingleTracks: true },
      soundcloud: { enabled: false, allowsSingleTracks: true },
      subsonic: { enabled: false, allowsSingleTracks: true },
      torrent: { enabled: false, allowsSingleTracks: false },
    };

    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

    expect(row("Source")).toHaveTextContent("Auto");
    expect(screen.queryByRole("button", { name: /^Matching/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Peers/ })).not.toBeInTheDocument();
    await user.click(row("Quality"));
    expect(screen.getByRole("radio", { name: "Lossless" })).toBeDisabled();
  });

  it("shows a FLAC preset's format as picked once Slskd leaves the chain, so the window never hides what it sends", async () => {
    const user = userEvent.setup();
    effectivePreset = LOSSLESS_PEERS;

    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);
    await user.click(row("Source"));
    await user.click(screen.getByRole("checkbox", { name: "Use Slskd" }));
    await user.click(row("Quality"));

    expect(screen.getByRole("radio", { name: "FLAC" })).toBeChecked();
  });

  describe("the request preset", () => {
    it("sends the config of the preset the caller resolved, untouched", async () => {
      const user = userEvent.setup();
      effectivePreset = LOSSLESS_PEERS;

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);
      await user.click(confirmButton());

      expect(batchMutate.mock.calls[0][0].config).toEqual({
        bitrate: { value: 256, matching: "strict" },
        format: { value: "flac", matching: "strict" },
        minUploadSpeed: 50,
        requireFreeSlot: true,
        sourceChain: ["ytdlp", "slskd"],
      });
    });

    it("shows a member their preset as locked rows and sends no config, so the server applies it", async () => {
      const user = userEvent.setup();
      role = "member";

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

      expect(document.querySelector('[data-cy="request-preset-locked"]')?.textContent).toContain("MP3 320");
      expect(screen.getByText("Only an admin can change it")).toBeInTheDocument();
      expect(row("Source")).toBeDisabled();
      expect(row("Quality")).toBeDisabled();

      await user.click(confirmButton());

      expect(requestMutate).toHaveBeenCalledTimes(1);
      expect(requestMutate.mock.calls[0][0]).not.toHaveProperty("config");
    });

    it("sends the factory-style config when that is what the preset resolves to", async () => {
      const user = userEvent.setup();

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);
      await user.click(confirmButton());

      expect(requestMutate.mock.calls[0][0].config).toEqual(MP3_320);
    });

    it("starts the source row from the preset's chain, with the other sources left off", async () => {
      const user = userEvent.setup();
      effectivePreset = LOSSLESS_PEERS;

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);

      expect(row("Source")).toHaveTextContent("YouTube → Slskd");
      expect(row("Quality")).toHaveTextContent("Lossless (Strict)");

      await user.click(row("Source"));

      expect(screen.getByRole("radio", { name: "Choose order" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Use YouTube" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Use Slskd" })).toBeChecked();
      const items = screen.getAllByRole("listitem").map((item) => item.textContent);
      expect(items[0]).toContain("YouTube");
      expect(items[1]).toContain("Slskd");
    });

    it("asks the destination for the preset's format, not a fixed one", () => {
      isAdmin = true;
      effectivePreset = LOSSLESS_PEERS;
      destinationPreview = undefined;

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);

      expect(destinationQuery).toHaveBeenLastCalledWith({
        albumExternalId: "al1",
        format: "flac",
        requestType: ContentType.enum.album,
      });
    });

    it("waits for the preset before it lets the request go", () => {
      effectivePreset = undefined;

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

      expect(confirmButton()).toBeDisabled();
      expect(confirmButton()).toHaveTextContent(/loading tracks/i);
      expect(recipeRows()).toBeNull();
    });

    it("waits for the source list before it lets the request go", () => {
      sourcesAvailability = undefined;
      sourcesPending = true;

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

      expect(confirmButton()).toBeDisabled();
      expect(recipeRows()).toBeNull();
    });

    it("still opens on the preset when the source list cannot be read", () => {
      sourcesAvailability = undefined;
      sourcesPending = false;

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

      expect(confirmButton()).toBeEnabled();
      expect(recipeRows()).not.toBeNull();
    });

    it("hides the rows and says so when the preset cannot be read, and sends no config", async () => {
      const user = userEvent.setup();
      effectivePreset = undefined;
      presetFailed = true;

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);

      expect(document.querySelector('[data-cy="request-preset-unavailable"]')).not.toBeNull();
      expect(recipeRows()).toBeNull();

      await user.click(confirmButton());

      expect(batchMutate).toHaveBeenCalledTimes(1);
      expect(batchMutate.mock.calls[0][0]).not.toHaveProperty("config");
    });
  });

  describe("lidarr for an album", () => {
    it("swaps the quality rows for the Lidarr inputs, drops the destination and refuses an incomplete delegate", async () => {
      const user = userEvent.setup();
      isAdmin = true;
      lidarrAvailable = { available: true };
      destinationPreview = {
        pathId: "primary",
        matched: [],
        winnerRuleId: null,
        lock: null,
        paths: [
          { id: "primary", label: "Music", accepts: true },
          { id: "soundtracks", label: "Soundtracks", accepts: true },
        ],
      };

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);
      expect(document.querySelector('[data-cy="request-destination"]')).not.toBeNull();
      expect(screen.queryByTestId("lidarr-inputs")).not.toBeInTheDocument();

      await user.click(row("Source"));
      await user.click(screen.getByRole("radio", { name: "Lidarr" }));

      expect(screen.getByTestId("lidarr-inputs")).toHaveAttribute("data-mode", "album");
      expect(row("Source")).toHaveTextContent("Lidarr");
      expect(screen.queryByRole("button", { name: /^Quality/ })).not.toBeInTheDocument();
      expect(document.querySelector('[data-cy="request-destination"]')).toBeNull();
      expect(destinationQuery).toHaveBeenLastCalledWith(null);

      await user.click(confirmButton());

      expect(toastError).toHaveBeenCalled();
      expect(batchMutate).not.toHaveBeenCalled();
    });
  });

  describe("destination", () => {
    function preview(overrides: Partial<DestinationPreview> = {}): DestinationPreview {
      return {
        pathId: "soundtracks",
        matched: [{ id: "r1", name: "Soundtracks", libraryPathId: "soundtracks" }],
        winnerRuleId: "r1",
        lock: null,
        paths: [
          { id: "primary", label: "Music", accepts: true },
          { id: "soundtracks", label: "Soundtracks", accepts: true },
          { id: "archive", label: "Archive", accepts: false },
        ],
        ...overrides,
      };
    }

    it("never asks a member, and sends no destination for them", async () => {
      const user = userEvent.setup();
      destinationPreview = preview();

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);

      expect(document.querySelector('[data-cy="request-destination"]')).toBeNull();
      expect(destinationQuery.mock.calls.every(([input]) => input === null)).toBe(true);
      await user.click(confirmButton());
      expect(batchMutate.mock.calls[0][0]).not.toHaveProperty("destinationPathId");
    });

    it("shows an admin where the rules send the album and which rules matched", async () => {
      const user = userEvent.setup();
      isAdmin = true;
      destinationPreview = preview();

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);

      expect(destinationQuery).toHaveBeenCalledWith({
        albumExternalId: "al1",
        format: "mp3",
        requestType: ContentType.enum.album,
      });
      expect(row("Destination")).toHaveTextContent("Soundtracks");

      await user.click(row("Destination"));

      expect(screen.getByRole("button", { name: "Library path" })).toHaveTextContent("Soundtracks");
      expect(screen.getByText(/Matched 1 rule:/)).toBeInTheDocument();
      expect(screen.getByText("Soundtracks", { selector: "p span" })).toBeInTheDocument();
    });

    it("leaves the destination to the rules when the admin keeps their choice", async () => {
      const user = userEvent.setup();
      isAdmin = true;
      destinationPreview = preview();

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);
      await user.click(confirmButton());

      expect(batchMutate.mock.calls[0][0]).not.toHaveProperty("destinationPathId");
    });

    it("sends the path an admin picks instead of the rules' choice, and counts it as a change", async () => {
      const user = userEvent.setup();
      isAdmin = true;
      destinationPreview = preview();

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);
      await user.click(row("Destination"));
      await user.click(screen.getByRole("button", { name: "Library path" }));
      await user.click(await screen.findByRole("menuitemradio", { name: "Music" }));

      expect(row("Destination")).toHaveTextContent("Music");
      expect(screen.getByText("1 change to your preset")).toBeInTheDocument();

      await user.click(confirmButton());

      expect(batchMutate.mock.calls[0][0].destinationPathId).toBe("primary");
    });

    it("offers only paths that take new music", async () => {
      const user = userEvent.setup();
      isAdmin = true;
      destinationPreview = preview();

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);
      await user.click(row("Destination"));
      await user.click(screen.getByRole("button", { name: "Library path" }));

      expect(await screen.findByRole("menuitemradio", { name: "Music" })).toBeInTheDocument();
      expect(screen.queryByRole("menuitemradio", { name: "Archive" })).toBeNull();
    });

    it("locks the field when the album already has songs in a path", async () => {
      const user = userEvent.setup();
      isAdmin = true;
      destinationPreview = preview({
        pathId: "primary",
        matched: [],
        winnerRuleId: null,
        lock: { reason: "album_in_path", tracks: 3 },
      });

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);
      await user.click(row("Destination"));

      expect(screen.getByRole("button", { name: "Library path" })).toBeDisabled();
      expect(
        screen.getByText("3 songs of this album are already in Music, the rest go with them.")
      ).toBeInTheDocument();
    });

    it("holds the path picker while the preview for a new format loads, so a pick is never read against the old one", async () => {
      const user = userEvent.setup();
      isAdmin = true;
      destinationPreview = preview();
      destinationRefreshing = true;

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);
      await user.click(row("Destination"));

      expect(screen.getByRole("button", { name: "Library path" })).toBeDisabled();
    });

    it("hides the row when there is only one path", () => {
      isAdmin = true;
      destinationPreview = preview({ paths: [{ id: "primary", label: "Music", accepts: true }], pathId: "primary" });

      render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);

      expect(document.querySelector('[data-cy="request-destination"]')).toBeNull();
    });

    it("asks for a single track by its album, and never for a playlist", () => {
      isAdmin = true;
      destinationPreview = preview();
      const track = makeTrack();

      const { unmount } = render(
        <ConfigRequestModal isOpen onClose={vi.fn()} item={track} itemType={ContentType.enum.track} />
      );
      expect(destinationQuery).toHaveBeenLastCalledWith({
        albumExternalId: track.album.id,
        format: "mp3",
        requestType: ContentType.enum.track,
      });
      unmount();
      destinationQuery.mockClear();

      render(
        <ConfigRequestModal
          isOpen
          onClose={vi.fn()}
          item={makePlaylist()}
          itemType={ContentType.enum.playlist}
          preloadedTracks={[makeTrack()]}
        />
      );
      expect(destinationQuery.mock.calls.every(([input]) => input === null)).toBe(true);
    });
  });

  it("warns and aborts when the album track list is empty", async () => {
    const user = userEvent.setup();
    contentResponse = { success: true, content: [] };

    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);

    await user.click(confirmButton());

    expect(batchMutate).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalled();
  });

  it("submits a playlist download with preloaded tracks", async () => {
    const user = userEvent.setup();

    render(
      <ConfigRequestModal
        isOpen
        onClose={vi.fn()}
        item={makePlaylist()}
        itemType={ContentType.enum.playlist}
        preloadedTracks={[makeTrack()]}
      />
    );

    await user.click(confirmButton());

    expect(playlistMutate).toHaveBeenCalledTimes(1);
    expect(playlistMutate.mock.calls[0][0].external_id).toBe("pl1");
    expect(playlistMutate.mock.calls[0][1]).toBeUndefined();
  });

  it("requests an artist's chosen tracks one by one, each with its own album, without creating a playlist", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ConfigRequestModal
        isOpen
        onClose={onClose}
        item={makeArtist()}
        itemType={ContentType.enum.artist}
        mode="artist-tracks"
        preloadedTracks={[makeTrack()]}
      />
    );

    await user.click(confirmButton());

    expect(tracksMutate).toHaveBeenCalledTimes(1);
    const payload = tracksMutate.mock.calls[0][0];
    expect(payload.tracks).toHaveLength(1);
    expect(payload.tracks[0].track.external_id).toBe("t1");
    expect(payload.tracks[0].album_external_id).toBe(makeTrack().album.id);
    expect(playlistMutate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("shows the rename input only for playlist items with the playlist name as placeholder", () => {
    const { unmount } = render(
      <ConfigRequestModal
        isOpen
        onClose={vi.fn()}
        item={makePlaylist()}
        itemType={ContentType.enum.playlist}
        preloadedTracks={[makeTrack()]}
      />
    );

    const input = screen.getByLabelText(/rename playlist/i);
    expect(input).toHaveAttribute("placeholder", "Playlist One");
    unmount();

    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);
    expect(screen.queryByLabelText(/rename playlist/i)).not.toBeInTheDocument();
  });

  it("hides the rename input for album items and lidarr-artist mode", () => {
    const { unmount } = render(
      <ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />
    );
    expect(screen.queryByLabelText(/rename playlist/i)).not.toBeInTheDocument();
    unmount();

    render(
      <ConfigRequestModal
        isOpen
        onClose={vi.fn()}
        item={makeArtist()}
        itemType={ContentType.enum.artist}
        mode="lidarr-artist"
      />
    );
    expect(screen.queryByLabelText(/rename playlist/i)).not.toBeInTheDocument();
  });

  it("overrides the playlist name with the trimmed rename value in the mutation payload", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfigRequestModal
        isOpen
        onClose={vi.fn()}
        item={makePlaylist()}
        itemType={ContentType.enum.playlist}
        preloadedTracks={[makeTrack()]}
        onSuccess={onSuccess}
      />
    );

    await user.type(screen.getByLabelText(/rename playlist/i), "  My Renamed List  ");
    await user.click(confirmButton());

    expect(playlistMutate).toHaveBeenCalledTimes(1);
    expect(playlistMutate.mock.calls[0][0].name).toBe("My Renamed List");
    expect(onSuccess).toHaveBeenCalledWith("My Renamed List");
  });

  it("keeps the original playlist name when the rename input is left empty", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfigRequestModal
        isOpen
        onClose={vi.fn()}
        item={makePlaylist()}
        itemType={ContentType.enum.playlist}
        preloadedTracks={[makeTrack()]}
        onSuccess={onSuccess}
      />
    );

    await user.click(confirmButton());

    expect(playlistMutate).toHaveBeenCalledTimes(1);
    expect(playlistMutate.mock.calls[0][0].name).toBe("Playlist One");
    expect(onSuccess).toHaveBeenCalledWith("Playlist One");
  });

  it("renders the artist lidarr delegation flow and refuses an incomplete delegate", async () => {
    const user = userEvent.setup();
    delegateMutate.mockImplementation((_payload, opts) => opts.onSuccess?.());
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <ConfigRequestModal
        isOpen
        onClose={onClose}
        item={makeArtist()}
        itemType={ContentType.enum.artist}
        mode="lidarr-artist"
      />
    );

    expect(screen.getByTestId("lidarr-inputs")).toHaveAttribute("data-mode", "artist");

    await user.click(screen.getByText(/add to lidarr/i));

    expect(toastError).toHaveBeenCalled();
    expect(delegateMutate).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("does not close while a mutation is pending", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    pendingFlags = { request: true, batch: false, playlist: false, tracks: false, delegate: false };

    render(<ConfigRequestModal isOpen onClose={onClose} item={makeTrack()} itemType={ContentType.enum.track} />);

    await user.click(closeButton());

    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows a neutral loading label, not the submitting label, while the track list is still fetching on open", () => {
    isLoadingTracks = true;
    contentResponse = undefined;

    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);

    expect(confirmButton()).toBeDisabled();
    expect(confirmButton()).toHaveTextContent(/loading tracks/i);
    expect(confirmButton()).not.toHaveTextContent(/requesting/i);
  });

  it("allows closing while the track list is still loading on open", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    isLoadingTracks = true;
    contentResponse = undefined;

    render(<ConfigRequestModal isOpen onClose={onClose} item={makeAlbum()} itemType={ContentType.enum.album} />);

    await user.click(closeButton());

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows the submitting label while a mutation is pending", () => {
    pendingFlags = { request: true, batch: false, playlist: false, tracks: false, delegate: false };

    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

    expect(confirmButton()).toBeDisabled();
    expect(confirmButton()).toHaveTextContent(/requesting/i);
  });

  it("closes on the close button when idle", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ConfigRequestModal isOpen onClose={onClose} item={makeTrack()} itemType={ContentType.enum.track} />);

    await user.click(closeButton());

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
