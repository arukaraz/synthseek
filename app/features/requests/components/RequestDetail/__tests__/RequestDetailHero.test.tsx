import { ContentType } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks, makeRequestsUser } from "../../../__tests__/factories";
import type { RequestDetailHeroMenuProps } from "../types";
import { RequestDetailHero } from "../RequestDetailHero";

type Actions = RequestDetailHeroMenuProps["actions"];

const { actionsRef, retry, openForTarget } = vi.hoisted(() => {
  const actionsRef: { current: Actions | null } = { current: null };
  return { actionsRef, retry: vi.fn(), openForTarget: vi.fn() };
});

function makeActions(overrides: Partial<Actions> = {}): Actions {
  return {
    retry,
    remove: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    resume: vi.fn(),
    prioritize: vi.fn(),
    syncPlex: vi.fn(),
    syncSourceNow: vi.fn(),
    exportJspf: vi.fn().mockResolvedValue(undefined),
    canManage: true,
    canRetry: false,
    canRemove: false,
    canCancel: false,
    canPause: false,
    canResume: false,
    isPaused: false,
    canPrioritize: false,
    canSyncPlex: false,
    canSyncSource: false,
    canExport: false,
    isRetrying: false,
    syncPlexPending: false,
    syncSourcePending: false,
    label: "Playlist",
    ...overrides,
  };
}

vi.mock("../../../hooks/useRequestActions", () => ({
  useRequestActions: () => actionsRef.current ?? makeActions(),
}));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForTarget }),
}));

vi.mock("../RequestDetailHeroMenu", () => ({
  RequestDetailHeroMenu: ({ onExportFull }: { onExportFull: () => void }) => (
    <button type="button" onClick={onExportFull}>
      kebab
    </button>
  ),
}));

vi.mock("../JspfExportDialog", () => ({
  JspfExportDialog: ({ open }: { open: boolean }) => (open ? <div>export dialog open</div> : null),
}));

function renderHero(overrides: Partial<Actions> = {}, requestOverrides = {}) {
  actionsRef.current = makeActions(overrides);
  return render(<RequestDetailHero request={makeRequestWithTracks(requestOverrides)} onBack={vi.fn()} />);
}

describe("RequestDetailHero", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the request name, artist and requester", () => {
    renderHero({}, { name: "Summer Mix", artist: "DJ Sun", requestedBy: makeRequestsUser({ username: "alice" }) });

    expect(screen.getByRole("heading", { name: "Summer Mix" })).toBeInTheDocument();
    expect(screen.getByText("DJ Sun")).toBeInTheDocument();
    expect(screen.getByText(/alice/)).toBeInTheDocument();
  });

  it("hides the kebab menu when no actions are permitted", () => {
    renderHero();

    expect(screen.queryByRole("button", { name: "kebab" })).not.toBeInTheDocument();
  });

  it("renders the kebab menu when at least one action is permitted", () => {
    renderHero({ canRemove: true });

    expect(screen.getAllByRole("button", { name: "kebab" }).length).toBeGreaterThan(0);
  });

  it("shows the retry button and triggers retry when retryable", async () => {
    const user = userEvent.setup();
    renderHero({ canRetry: true });

    await user.click(screen.getByRole("button", { name: "Retry Failed" }));

    expect(retry).toHaveBeenCalledOnce();
  });

  it("disables the retry button while a retry is in flight", () => {
    renderHero({ canRetry: true, isRetrying: true });

    expect(screen.getByRole("button", { name: "Retry Failed" })).toBeDisabled();
  });

  it("renders the album label when the request is not a playlist", () => {
    renderHero({ label: "Album" });

    expect(screen.getAllByText("Album").length).toBeGreaterThan(0);
  });

  it("shows the delegated-to line only when the request is delegated", () => {
    const { rerender } = render(
      <RequestDetailHero request={makeRequestWithTracks({ delegated_to: null })} onBack={vi.fn()} />
    );
    expect(screen.queryByText(/Delegated to/)).not.toBeInTheDocument();

    actionsRef.current = makeActions();
    rerender(<RequestDetailHero request={makeRequestWithTracks({ delegated_to: "remote peer" })} onBack={vi.fn()} />);
    expect(screen.getByText(/Delegated to/)).toBeInTheDocument();
    expect(screen.getByText("Remote Peer")).toBeInTheDocument();
  });

  it("opens the full export dialog from the mobile kebab callback", async () => {
    const user = userEvent.setup();
    renderHero({ canExport: true });

    expect(screen.queryByText("export dialog open")).not.toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "kebab" })[0]);

    expect(screen.getByText("export dialog open")).toBeInTheDocument();
  });

  it("opens the full export dialog from the desktop kebab callback", async () => {
    const user = userEvent.setup();
    renderHero({ canExport: true });
    const kebabs = screen.getAllByRole("button", { name: "kebab" });

    await user.click(kebabs[kebabs.length - 1]);

    expect(screen.getByText("export dialog open")).toBeInTheDocument();
  });

  it("renders the cover art when album_art is present", () => {
    renderHero({}, { album_art: "https://example.com/cover.jpg", name: "With Art" });

    expect(screen.getByRole("img", { name: "With Art" })).toBeInTheDocument();
  });

  it("calls onBack from the mobile back control", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    actionsRef.current = makeActions();
    render(<RequestDetailHero request={makeRequestWithTracks()} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: "Back to requests list" }));

    expect(onBack).toHaveBeenCalledOnce();
  });

  it("opens the album detail from the title of an album request", async () => {
    const user = userEvent.setup();
    renderHero(
      { label: "Album" },
      {
        contentType: ContentType.enum.album,
        id: "album-row-1",
        external_id: "123456",
        name: "Discovery",
        artist: "Daft Punk",
      }
    );

    await user.click(screen.getByRole("button", { name: "Discovery" }));

    expect(openForTarget).toHaveBeenCalledWith({
      mode: "album",
      id: "123456",
      name: "Discovery",
      artistName: "Daft Punk",
      cover: null,
    });
  });

  it("opens the same detail from the artwork of an album request", async () => {
    const user = userEvent.setup();
    renderHero(
      { label: "Album" },
      {
        contentType: ContentType.enum.album,
        external_id: "123456",
        name: "Discovery",
        artist: "Daft Punk",
        album_art: "https://example.com/cover.jpg",
      }
    );

    await user.click(screen.getByRole("button", { name: "Open details for Discovery" }));

    expect(openForTarget).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "album", id: "123456", cover: "https://example.com/cover.jpg" })
    );
  });

  it("opens the local playlist detail from a playlist request", async () => {
    const user = userEvent.setup();
    renderHero(
      {},
      {
        contentType: ContentType.enum.playlist,
        id: "playlist-row-1",
        external_id: "local_abc123",
        name: "Summer Mix",
      }
    );

    await user.click(screen.getByRole("button", { name: "Summer Mix" }));

    expect(openForTarget).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "playlist", id: "playlist-row-1", playlistSource: "library" })
    );
  });

  it("keeps the heading readable as the plain request name", () => {
    renderHero({ label: "Album" }, { contentType: ContentType.enum.album, name: "Discovery" });

    expect(screen.getByRole("heading", { name: "Discovery" })).toBeInTheDocument();
  });

  it("renders no interactive title or artwork for a content type with no detail destination", () => {
    renderHero(
      {},
      {
        contentType: ContentType.enum.artist,
        name: "Daft Punk",
        album_art: "https://example.com/cover.jpg",
      }
    );

    expect(screen.getByRole("heading", { name: "Daft Punk" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Daft Punk" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open details for Daft Punk" })).not.toBeInTheDocument();
  });
});
