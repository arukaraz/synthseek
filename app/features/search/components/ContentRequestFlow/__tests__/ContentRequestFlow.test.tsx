import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { ContentType } from "@api/__generated__/types";
import { createMockAlbumSimplified, createMockTrackFull } from "@test/factories";
import { act, renderWithProviders, renderHookWithProviders, screen, waitFor } from "@test/test-utils";

import { ContentRequestFlow, useContentRequestFlow } from "../ContentRequestFlow";
import type { ContentDetailActions } from "@features/content-detail";

import type { FlowContextValue } from "../types";

const flowState = vi.hoisted(() => ({
  selectedResult: null as { type: string; id: string; name?: string } | null,
  selectedContentToRequest: null as { type: string; id: string; name?: string } | null,
  openForResult: vi.fn(),
  requestContent: vi.fn(),
  requestArtistLidarr: vi.fn(),
  requestPlaylistConfig: vi.fn(),
  requestArtistTracksConfig: vi.fn(),
  contentDetailModalProps: { open: false, onClose: vi.fn() },
  configModalProps: { isOpen: false },
}));

const api = vi.hoisted(() => {
  const detail: { actions: ContentDetailActions | null } = { actions: null };
  return {
    fetchContents: vi.fn(),
    requestMutate: vi.fn(),
    batchMutate: vi.fn(),
    playlistMutate: vi.fn(),
    tracksMutate: vi.fn(),
    toastError: vi.fn(),
    detail,
  };
});

vi.mock("@hooks/ui/useContentRequestModals", () => ({
  useContentRequestModals: () => flowState,
}));

vi.mock("@hooks/api", () => ({
  useContentsFetcher: () => api.fetchContents,
  useRequest: () => ({ mutate: api.requestMutate, isPending: false }),
  useBatchRequest: () => ({ mutate: api.batchMutate, isPending: false }),
  usePlaylistRequest: () => ({ mutate: api.playlistMutate, isPending: false }),
  useRequestTracks: () => ({ mutate: api.tracksMutate, isPending: false }),
}));

vi.mock("sonner", () => ({ toast: { error: api.toastError } }));

vi.mock("@features/content-detail", () => ({
  ContentDetailModal: ({
    open,
    target,
    actions,
  }: {
    open: boolean;
    target: { id: string } | null;
    actions: ContentDetailActions;
  }) => {
    api.detail.actions = actions;
    return open && target ? <div data-testid="detail-modal">{target.id}</div> : null;
  },
  albumRequestItem: (input: { id: string; name: string }) => makeAlbum({ id: input.id, name: input.name }),
  artistRequestItem: (input: { id: string; name: string }) => makeArtist(input),
  trackRequestItem: (input: { id: string; title: string }) => ({ ...makeTrack(), id: input.id, title: input.title }),
  playlistOpenItem: (input: { id: string; name: string }) => makePlaylist(input),
  playlistRequestTracks: (tracks: unknown[]) => tracks,
  detailTargetFromMusicItem: (item: { id: string }) => ({ id: item.id }),
}));

vi.mock("../../ConfigRequestModal/ConfigRequestModal", () => ({
  ConfigRequestModal: () => <div data-testid="config-modal" />,
}));

function makeTrack() {
  return {
    ...createMockTrackFull({ id: "t1", title: "Track One", name: "Track One" }),
    type: ContentType.enum.track,
  };
}

function makeAlbum(overrides: { id?: string; name?: string } = {}) {
  return {
    ...createMockAlbumSimplified({ id: overrides.id ?? "al1", name: overrides.name ?? "Album One" }),
    type: ContentType.enum.album,
    artist: "Album Artist",
    artists: [{ id: "a1", name: "Album Artist" }],
    genres: ["rock"],
  };
}

function makePlaylist(overrides: { id?: string; name?: string } = {}) {
  return {
    id: overrides.id ?? "pl1",
    type: ContentType.enum.playlist,
    name: overrides.name ?? "Playlist One",
    description: "desc",
    owner: { id: "u1", name: "Owner" },
    images: [{ url: "https://img", height: 100, width: 100 }],
    total_tracks: 1,
  };
}

function makeArtist(overrides: { id?: string; name?: string } = {}) {
  return {
    id: overrides.id ?? "ar1",
    type: ContentType.enum.artist,
    name: overrides.name ?? "Artist One",
    images: [{ url: "https://img", height: 100, width: 100 }],
  };
}

function Trigger({ run }: { run: (flow: FlowContextValue) => void }) {
  const flow = useContentRequestFlow();
  return (
    <button type="button" onClick={() => run(flow)}>
      go
    </button>
  );
}

function renderTrigger(run: (flow: FlowContextValue) => void) {
  return renderWithProviders(
    <ContentRequestFlow>
      <Trigger run={run} />
    </ContentRequestFlow>
  );
}

function nothingSent() {
  expect(api.requestMutate).not.toHaveBeenCalled();
  expect(api.batchMutate).not.toHaveBeenCalled();
  expect(api.playlistMutate).not.toHaveBeenCalled();
  expect(api.tracksMutate).not.toHaveBeenCalled();
}

describe("useContentRequestFlow", () => {
  it("throws when used outside of the provider", () => {
    expect(() => renderHookWithProviders(() => useContentRequestFlow())).toThrow(
      "useContentRequestFlow must be used within ContentRequestFlow"
    );
  });
});

describe("ContentRequestFlow", () => {
  beforeEach(() => {
    flowState.selectedResult = null;
    flowState.selectedContentToRequest = null;
    flowState.contentDetailModalProps.open = false;
    api.detail.actions = null;
    api.fetchContents.mockResolvedValue({ success: true, content: [makeTrack()] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders its children", () => {
    renderWithProviders(
      <ContentRequestFlow>
        <p>flow child</p>
      </ContentRequestFlow>
    );

    expect(screen.getByText("flow child")).toBeInTheDocument();
  });

  it("renders neither modal when nothing is selected", () => {
    renderWithProviders(
      <ContentRequestFlow>
        <p>flow child</p>
      </ContentRequestFlow>
    );

    expect(screen.queryByTestId("detail-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("config-modal")).not.toBeInTheDocument();
  });

  it("opens the detail modal for a non-track selection", () => {
    flowState.selectedResult = { type: "album", id: "al1" };
    flowState.contentDetailModalProps.open = true;

    renderWithProviders(
      <ContentRequestFlow>
        <p>flow child</p>
      </ContentRequestFlow>
    );

    expect(screen.getByTestId("detail-modal")).toHaveTextContent("al1");
    expect(screen.queryByTestId("config-modal")).not.toBeInTheDocument();
  });

  it("does not open the detail modal for a track selection", () => {
    flowState.selectedResult = { type: "track", id: "t1" };
    flowState.contentDetailModalProps.open = true;

    renderWithProviders(
      <ContentRequestFlow>
        <p>flow child</p>
      </ContentRequestFlow>
    );

    expect(screen.queryByTestId("detail-modal")).not.toBeInTheDocument();
  });

  it("renders the config modal when there is content to request", () => {
    flowState.selectedContentToRequest = { type: "track", id: "t1" };

    renderWithProviders(
      <ContentRequestFlow>
        <p>flow child</p>
      </ContentRequestFlow>
    );

    expect(screen.getByTestId("config-modal")).toBeInTheDocument();
  });

  it("exposes openForResult through the context", () => {
    let captured: ((result: unknown) => void) | null = null;

    function Consumer() {
      const flow = useContentRequestFlow();
      captured = flow.openForResult;
      return null;
    }

    renderWithProviders(
      <ContentRequestFlow>
        <Consumer />
      </ContentRequestFlow>
    );

    expect(captured).toBe(flowState.openForResult);
  });

  describe("a direct request", () => {
    it("sends an album with the caller's preset, no config, and never opens the config modal", async () => {
      const album = makeAlbum();
      const { user } = renderTrigger((flow) => flow.requestResult(album));

      await user.click(screen.getByRole("button", { name: "go" }));

      await waitFor(() => expect(api.batchMutate).toHaveBeenCalledTimes(1));
      expect(api.fetchContents).toHaveBeenCalledWith("al1", ContentType.enum.album);
      const payload = api.batchMutate.mock.calls[0][0];
      expect(payload.external_id).toBe("al1");
      expect(payload.tracks).toHaveLength(1);
      expect(payload).not.toHaveProperty("config");
      expect(flowState.requestContent).not.toHaveBeenCalled();
      expect(screen.queryByTestId("config-modal")).not.toBeInTheDocument();
    });

    it("is what a request means when the caller names no intent, and when it names direct", async () => {
      const { user } = renderTrigger((flow) => {
        flow.requestResult(makeAlbum({ id: "plain" }));
        flow.requestResult(makeAlbum({ id: "named" }), "direct");
      });

      await user.click(screen.getByRole("button", { name: "go" }));

      await waitFor(() => expect(api.batchMutate).toHaveBeenCalledTimes(2));
      const sent = api.batchMutate.mock.calls.map(([payload]) => payload);
      expect(sent.map((payload) => payload.external_id).sort()).toEqual(["named", "plain"]);
      sent.forEach((payload) => expect(payload).not.toHaveProperty("config"));
      expect(flowState.requestContent).not.toHaveBeenCalled();
    });

    it("sends a single track at once, without fetching anything and without a config", async () => {
      const { user } = renderTrigger((flow) => flow.requestResult(makeTrack()));

      await user.click(screen.getByRole("button", { name: "go" }));

      await waitFor(() => expect(api.requestMutate).toHaveBeenCalledTimes(1));
      expect(api.fetchContents).not.toHaveBeenCalled();
      expect(api.requestMutate.mock.calls[0][0].track.external_id).toBe("t1");
      expect(api.requestMutate.mock.calls[0][0]).not.toHaveProperty("config");
      expect(flowState.requestContent).not.toHaveBeenCalled();
    });

    it("tells the user when the album has no tracks to send, and sends nothing", async () => {
      api.fetchContents.mockResolvedValue({ success: true, content: [] });
      const { user } = renderTrigger((flow) => flow.requestResult(makeAlbum()));

      await user.click(screen.getByRole("button", { name: "go" }));

      await waitFor(() => expect(api.toastError).toHaveBeenCalledTimes(1));
      nothingSent();
    });

    it("tells the user when the tracks could not be fetched, and sends nothing", async () => {
      api.fetchContents.mockRejectedValue(new Error("offline"));
      const { user } = renderTrigger((flow) => flow.requestResult(makeAlbum()));

      await user.click(screen.getByRole("button", { name: "go" }));

      await waitFor(() => expect(api.toastError).toHaveBeenCalledTimes(1));
      nothingSent();
    });

    it("sends once the tracks arrive, not before", async () => {
      let release: (value: unknown) => void = () => {};
      api.fetchContents.mockReturnValue(
        new Promise((resolve) => {
          release = resolve;
        })
      );
      const { user } = renderTrigger((flow) => flow.requestResult(makeAlbum()));

      await user.click(screen.getByRole("button", { name: "go" }));
      expect(api.batchMutate).not.toHaveBeenCalled();

      release({ success: true, content: [makeTrack()] });
      await waitFor(() => expect(api.batchMutate).toHaveBeenCalledTimes(1));
    });
  });

  describe("a customized request", () => {
    it("opens the config for the result and sends nothing itself", async () => {
      const album = makeAlbum();
      const { user } = renderTrigger((flow) => flow.requestResult(album, "customize"));

      await user.click(screen.getByRole("button", { name: "go" }));

      expect(flowState.requestContent).toHaveBeenCalledWith(album);
      expect(api.fetchContents).not.toHaveBeenCalled();
      nothingSent();
    });
  });

  describe("a request from the detail view", () => {
    function renderDetail() {
      return renderWithProviders(
        <ContentRequestFlow>
          <p>flow child</p>
        </ContentRequestFlow>
      );
    }

    function actions() {
      if (api.detail.actions === null) throw new Error("the detail modal was not rendered");
      return api.detail.actions;
    }

    it("sends an album straight away by default and opens the config when asked to customize", async () => {
      renderDetail();

      actions().requestAlbum({ id: "al1", name: "Album One" });
      await waitFor(() => expect(api.batchMutate).toHaveBeenCalledTimes(1));
      expect(flowState.requestContent).not.toHaveBeenCalled();

      actions().requestAlbum({ id: "al1", name: "Album One" }, "customize");
      expect(flowState.requestContent).toHaveBeenCalledTimes(1);
      expect(api.batchMutate).toHaveBeenCalledTimes(1);
    });

    it("sends a track straight away by default and opens the config when asked to customize", async () => {
      renderDetail();

      actions().requestTrack({ id: "t1", title: "Track One" }, "direct");
      await waitFor(() => expect(api.requestMutate).toHaveBeenCalledTimes(1));
      expect(flowState.requestContent).not.toHaveBeenCalled();

      actions().requestTrack({ id: "t1", title: "Track One" }, "customize");
      expect(flowState.requestContent).toHaveBeenCalledTimes(1);
      expect(api.requestMutate).toHaveBeenCalledTimes(1);
    });

    it("asks before it sends a whole playlist, then sends it with the preset only once confirmed", async () => {
      const { user } = renderDetail();
      const tracks = [makeTrack(), { ...makeTrack(), id: "t2" }];

      await act(async () => {
        actions().requestPlaylist({ id: "pl1", name: "Trip-hop", cover: null, totalTracks: 2, tracks });
      });

      expect(await screen.findByText("Request Trip-hop?")).toBeInTheDocument();
      expect(screen.getByText("This sends 2 tracks with your request preset.")).toBeInTheDocument();
      nothingSent();

      await user.click(screen.getByRole("button", { name: "Request 2 tracks" }));

      expect(api.playlistMutate).toHaveBeenCalledTimes(1);
      expect(api.playlistMutate.mock.calls[0][0].external_id).toBe("pl1");
      expect(api.playlistMutate.mock.calls[0][0].tracks).toHaveLength(2);
      expect(api.playlistMutate.mock.calls[0][0]).not.toHaveProperty("config");
      expect(api.fetchContents).not.toHaveBeenCalled();
    });

    it("sends nothing when the confirmation for a playlist is cancelled", async () => {
      const { user } = renderDetail();

      await act(async () => {
        actions().requestPlaylist({ id: "pl1", name: "Trip-hop", cover: null, totalTracks: 1, tracks: [makeTrack()] });
      });
      await screen.findByText("Request Trip-hop?");
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() => expect(screen.queryByText("Request Trip-hop?")).not.toBeInTheDocument());
      nothingSent();
    });

    it("opens the config for a playlist, with its tracks, without asking first", () => {
      renderDetail();
      const tracks = [makeTrack()];

      actions().requestPlaylist({ id: "pl1", name: "Trip-hop", cover: null, totalTracks: 1, tracks }, "customize");

      expect(flowState.requestPlaylistConfig).toHaveBeenCalledWith(expect.objectContaining({ id: "pl1" }), tracks);
      expect(screen.queryByText("Request Trip-hop?")).not.toBeInTheDocument();
      nothingSent();
    });

    it("asks before it sends an artist's top tracks, then sends them one by one once confirmed", async () => {
      const { user } = renderDetail();
      const tracks = [makeTrack(), { ...makeTrack(), id: "t2" }, { ...makeTrack(), id: "t3" }];

      await act(async () => {
        actions().requestTopTracks({ artist: { id: "ar1", name: "Artist One", cover: null }, tracks });
      });

      expect(await screen.findByText("Request Artist One?")).toBeInTheDocument();
      expect(screen.getByText("This sends 3 tracks with your request preset.")).toBeInTheDocument();
      nothingSent();

      await user.click(screen.getByRole("button", { name: "Request 3 tracks" }));

      expect(api.tracksMutate).toHaveBeenCalledTimes(1);
      expect(api.tracksMutate.mock.calls[0][0].tracks).toHaveLength(3);
      expect(api.tracksMutate.mock.calls[0][0]).not.toHaveProperty("config");
    });

    it("opens the track config for an artist's top tracks when asked to customize", () => {
      renderDetail();
      const tracks = [makeTrack()];

      actions().requestTopTracks({ artist: { id: "ar1", name: "Artist One", cover: null }, tracks }, "customize");

      expect(flowState.requestArtistTracksConfig).toHaveBeenCalledWith(expect.objectContaining({ id: "ar1" }), tracks);
      nothingSent();
    });
  });
});
