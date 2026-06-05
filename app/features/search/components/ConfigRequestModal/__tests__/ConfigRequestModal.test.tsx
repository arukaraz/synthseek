import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { createMockTrackFull, createMockAlbumSimplified } from "@test/factories";
import { mockRouter } from "@test/mocks/next.mock";

const mocks = vi.hoisted(() => ({
  requestMutate: vi.fn(),
  batchMutate: vi.fn(),
  playlistMutate: vi.fn(),
  delegateMutate: vi.fn(),
  toastError: vi.fn(),
}));

const { requestMutate, batchMutate, playlistMutate, delegateMutate, toastError } = mocks;

let sourcesAvailability: { slskd: boolean; ytdlp: boolean } | undefined;
let lidarrAvailable: { available: boolean } | undefined;
let contentResponse: { success: boolean; content: unknown } | undefined;
let isLoadingTracks: boolean;
let pendingFlags: {
  request: boolean;
  batch: boolean;
  playlist: boolean;
  delegate: boolean;
};

vi.mock("@hooks/api", () => ({
  useDownloadSourcesAvailability: () => ({ data: sourcesAvailability }),
  useLidarrAvailable: () => ({ data: lidarrAvailable }),
  useGetContents: () => ({ data: contentResponse, isLoading: isLoadingTracks }),
  useRequest: () => ({ mutate: mocks.requestMutate, isPending: pendingFlags.request }),
  useBatchRequest: () => ({ mutate: mocks.batchMutate, isPending: pendingFlags.batch }),
  usePlaylistRequest: () => ({ mutate: mocks.playlistMutate, isPending: pendingFlags.playlist }),
  useDelegateArtist: () => ({ mutate: mocks.delegateMutate, isPending: pendingFlags.delegate }),
}));

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError },
}));

vi.mock("../ConfigHeader", () => ({
  ConfigHeader: (props: { name: string }) => <div data-testid="config-header">{props.name}</div>,
}));

vi.mock("../AcquisitionDropdown", () => ({
  AcquisitionDropdown: (props: { value: string }) => (
    <div data-testid="acquisition-dropdown" data-value={props.value} />
  ),
}));

vi.mock("../LidarrInputs", () => ({
  LidarrInputs: (props: { monitorMode: string }) => <div data-testid="lidarr-inputs" data-mode={props.monitorMode} />,
}));

vi.mock("../OptionGrid", () => ({
  OptionGrid: (props: { label: string }) => <div data-testid="option-grid">{props.label}</div>,
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
    sourcesAvailability = { slskd: true, ytdlp: true };
    lidarrAvailable = { available: false };
    contentResponse = { success: true, content: [makeTrack()] };
    isLoadingTracks = false;
    pendingFlags = { request: false, batch: false, playlist: false, delegate: false };
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

  it("renders the download configuration for a track", () => {
    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeTrack()} itemType={ContentType.enum.track} />);

    expect(screen.getByTestId("config-header")).toBeInTheDocument();
    expect(screen.getByTestId("acquisition-dropdown")).toBeInTheDocument();
  });

  it("submits a single track download and navigates to the request groups view", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    requestMutate.mockImplementation((_payload, opts) => opts.onSuccess?.());

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
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining("/requests?view=groups"));
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("submits an album batch download", async () => {
    const user = userEvent.setup();
    contentResponse = { success: true, content: [makeTrack()] };

    render(<ConfigRequestModal isOpen onClose={vi.fn()} item={makeAlbum()} itemType={ContentType.enum.album} />);

    await user.click(confirmButton());

    expect(batchMutate).toHaveBeenCalledTimes(1);
    expect(batchMutate.mock.calls[0][0].external_id).toBe("al1");
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
  });

  it("renders the artist lidarr delegation flow and submits a complete delegate", async () => {
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
    pendingFlags = { request: true, batch: false, playlist: false, delegate: false };

    render(<ConfigRequestModal isOpen onClose={onClose} item={makeTrack()} itemType={ContentType.enum.track} />);

    await user.click(screen.getByText(/cancel/i));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on cancel when idle", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ConfigRequestModal isOpen onClose={onClose} item={makeTrack()} itemType={ContentType.enum.track} />);

    await user.click(screen.getByText(/cancel/i));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
