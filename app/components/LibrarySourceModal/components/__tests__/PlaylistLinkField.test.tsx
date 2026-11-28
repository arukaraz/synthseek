import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LibrarySourceDescription } from "@hooks/api/queries/library-source/types";
import i18n from "@locale";
import enErrors from "@modules/i18n/messages/en/errors.json";
import enLibrary from "@modules/i18n/messages/en/library.json";
import { createMockLibraryItem } from "@test/mocks/feature-hooks.mock";

const load = vi.hoisted(() => ({ mutateAsync: vi.fn(), isPending: false }));

vi.mock("@hooks/api/mutations/library-source/useLoadPlaylistFromLink", () => ({
  useLoadPlaylistFromLink: () => load,
}));

import { PlaylistLinkField } from "../PlaylistLinkField";

const LINK = "https://www.youtube.com/playlist?list=PL123";

function source(overrides: Partial<LibrarySourceDescription["capabilities"]["playlistLinks"]> = {}) {
  const description: LibrarySourceDescription = {
    provider: "youtube",
    name: "YouTube",
    configured: true,
    connected: false,
    pending: false,
    needsReconnect: false,
    externalUsername: null,
    capabilities: {
      connect: "session",
      itemTypes: ["playlist", "liked"],
      watch: { playlists: true, savedAlbums: false },
      streamsAudio: false,
      playlistLinks: { accepted: true, needsConnection: false, ...overrides },
    },
  };
  return description;
}

function input() {
  return screen.getByLabelText(enLibrary.librarySource.link.label);
}

function loadButton() {
  return screen.getByRole("button", { name: enLibrary.librarySource.link.load });
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
  load.isPending = false;
});

describe("PlaylistLinkField", () => {
  it("loads the pasted link for its source and hands the playlist on", async () => {
    const item = createMockLibraryItem({ id: "PL123", name: "Road trip" });
    load.mutateAsync.mockResolvedValue(item);
    const onLoaded = vi.fn();
    render(<PlaylistLinkField source={source()} connected={false} onLoaded={onLoaded} />);

    await userEvent.type(input(), `  ${LINK}  `);
    await userEvent.click(loadButton());

    expect(load.mutateAsync).toHaveBeenCalledWith({ provider: "youtube", link: LINK });
    await vi.waitFor(() => expect(onLoaded).toHaveBeenCalledWith(item));
    expect(input()).toHaveValue("");
  });

  it("fires one load when Load is pressed twice before the first answers", async () => {
    const pending = deferred<ReturnType<typeof createMockLibraryItem>>();
    load.mutateAsync.mockReturnValue(pending.promise);
    render(<PlaylistLinkField source={source()} connected={false} onLoaded={vi.fn()} />);

    await userEvent.type(input(), LINK);
    fireEvent.click(loadButton());
    fireEvent.click(loadButton());
    fireEvent.submit(input());

    expect(load.mutateAsync).toHaveBeenCalledTimes(1);
    pending.resolve(createMockLibraryItem());
  });

  it("says it is still reading while a large playlist loads, and locks the action", () => {
    load.isPending = true;
    render(<PlaylistLinkField source={source()} connected={false} onLoaded={vi.fn()} />);

    expect(screen.getByText(i18n.t("library:librarySource.link.busy", { provider: "YouTube" }))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enLibrary.librarySource.link.loading })).toBeDisabled();
    expect(input()).toHaveAttribute("readonly");
  });

  it("says inline when the link is not a playlist of this source", async () => {
    load.mutateAsync.mockRejectedValue({ message: "no", data: { appCode: "LIBRARY_SOURCE_LINK_NOT_RECOGNIZED" } });
    render(<PlaylistLinkField source={source()} connected={false} onLoaded={vi.fn()} />);

    await userEvent.type(input(), "https://example.com/list");
    await userEvent.click(loadButton());

    expect(await screen.findByText(enErrors.LIBRARY_SOURCE_LINK_NOT_RECOGNIZED.title)).toBeInTheDocument();
    expect(screen.getByText(enErrors.LIBRARY_SOURCE_LINK_NOT_RECOGNIZED.description)).toBeInTheDocument();
  });

  it("says inline when the playlist does not exist or is private, and drops the notice once the link changes", async () => {
    load.mutateAsync.mockRejectedValue({ message: "no", data: { appCode: "LIBRARY_SOURCE_PLAYLIST_UNAVAILABLE" } });
    render(<PlaylistLinkField source={source()} connected={false} onLoaded={vi.fn()} />);

    await userEvent.type(input(), LINK);
    await userEvent.click(loadButton());

    expect(await screen.findByText(enErrors.LIBRARY_SOURCE_PLAYLIST_UNAVAILABLE.description)).toBeInTheDocument();
    await userEvent.type(input(), "x");
    expect(screen.queryByText(enErrors.LIBRARY_SOURCE_PLAYLIST_UNAVAILABLE.description)).not.toBeInTheDocument();
  });

  it("explains that connecting comes first when the source needs it, and sends nothing", async () => {
    render(<PlaylistLinkField source={source({ needsConnection: true })} connected={false} onLoaded={vi.fn()} />);

    expect(
      screen.getByText(i18n.t("library:librarySource.link.needsConnection", { provider: "YouTube" }))
    ).toBeInTheDocument();
    expect(input()).toBeDisabled();
    expect(loadButton()).toBeDisabled();
    fireEvent.submit(input());
    expect(load.mutateAsync).not.toHaveBeenCalled();
  });

  it("lets a source that needs a connection load links once it is connected", () => {
    render(<PlaylistLinkField source={source({ needsConnection: true })} connected onLoaded={vi.fn()} />);

    expect(input()).toBeEnabled();
    expect(
      screen.queryByText(i18n.t("library:librarySource.link.needsConnection", { provider: "YouTube" }))
    ).not.toBeInTheDocument();
  });
});
