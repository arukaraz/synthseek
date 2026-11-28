import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import type { LibrarySourceDescription } from "@hooks/api/queries/library-source/types";
import i18n from "@locale";
import enComponents from "@modules/i18n/messages/en/components.json";
import enLibrary from "@modules/i18n/messages/en/library.json";

const connect = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));

vi.mock("@hooks/api/mutations/library-source/useConnectLibrarySource", () => ({
  useConnectLibrarySource: () => connect,
}));

vi.mock("@hooks/api/mutations/library-source/useConnectLibrarySession", () => ({
  useConnectLibrarySession: () => ({ mutateAsync: vi.fn(), reset: vi.fn(), isPending: false }),
}));

import { ConnectPrompt } from "../ConnectPrompt";

function source(overrides: Partial<LibrarySourceDescription> = {}): LibrarySourceDescription {
  return {
    provider: "spotify",
    name: "Spotify",
    configured: true,
    connected: false,
    pending: false,
    needsReconnect: false,
    externalUsername: null,
    capabilities: {
      connect: "oauth",
      itemTypes: ["playlist", "album", "liked"],
      watch: { playlists: true, savedAlbums: true },
      streamsAudio: false,
      playlistLinks: { accepted: true, needsConnection: true },
    },
    ...overrides,
  };
}

function named(text: string, provider = "Spotify") {
  return text.replaceAll("{{provider}}", provider);
}

beforeEach(() => {
  vi.clearAllMocks();
  connect.isPending = false;
});

describe("ConnectPrompt", () => {
  it("says it is checking while the source has not been described yet", () => {
    render(<ConnectPrompt source={undefined} />);

    expect(screen.getByText(enLibrary.librarySource.connect.checking)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("asks an OAuth source to connect under its own name and starts that source's authorization", async () => {
    render(<ConnectPrompt source={source({ name: "Deezer Test" })} />);

    expect(screen.getByText(named(enLibrary.librarySource.connect.title, "Deezer Test"))).toBeInTheDocument();
    expect(screen.getByText(named(enLibrary.librarySource.connect.bodyDefault, "Deezer Test"))).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: named(enLibrary.librarySource.connect.connect, "Deezer Test") })
    );

    expect(connect.mutate).toHaveBeenCalledWith({ provider: "spotify" });
  });

  it("offers a reconnect while the authorization is still pending", () => {
    render(<ConnectPrompt source={source({ pending: true })} />);

    expect(screen.getByText(named(enLibrary.librarySource.connect.bodyPending))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: named(enLibrary.librarySource.connect.reconnect) })).toBeEnabled();
  });

  it("explains an expired connection and offers a reconnect", () => {
    render(<ConnectPrompt source={source()} expired />);

    expect(screen.getByText(named(enLibrary.librarySource.connect.expiredTitle))).toBeInTheDocument();
    expect(screen.getByText(named(enLibrary.librarySource.connect.bodyExpired))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: named(enLibrary.librarySource.connect.reconnect) })).toBeInTheDocument();
  });

  it("disables the connect button when the admin has not configured the source", () => {
    render(<ConnectPrompt source={source({ configured: false })} />);

    expect(screen.getByRole("button", { name: named(enLibrary.librarySource.connect.connect) })).toBeDisabled();
  });

  it("disables the connect button while an authorization is already starting", () => {
    connect.isPending = true;

    render(<ConnectPrompt source={source()} />);

    expect(screen.getByRole("button", { name: named(enLibrary.librarySource.connect.connect) })).toBeDisabled();
  });

  it("sends an account-linked source to the connected accounts page instead of starting an authorization", () => {
    render(
      <ConnectPrompt
        source={source({
          name: "Navidrome",
          capabilities: {
            connect: "account",
            itemTypes: ["playlist"],
            watch: { playlists: true, savedAlbums: false },
            streamsAudio: true,
            playlistLinks: { accepted: false, needsConnection: false },
          },
        })}
      />
    );

    expect(screen.getByText(named(enLibrary.librarySource.connect.bodyAccount, "Navidrome"))).toBeInTheDocument();
    const link = screen.getByRole("link", { name: named(enLibrary.librarySource.connect.linkAccount, "Navidrome") });
    expect(link).toHaveAttribute("href", "/settings/connections/services");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(connect.mutate).not.toHaveBeenCalled();
  });

  const sessionCapabilities: LibrarySourceDescription["capabilities"] = {
    connect: "session",
    itemTypes: ["playlist", "liked"],
    watch: { playlists: true, savedAlbums: false },
    streamsAudio: false,
    playlistLinks: { accepted: true, needsConnection: false },
  };

  it("asks a session source for its pasted session, with the account warning, instead of an authorization", () => {
    render(
      <ConnectPrompt source={source({ provider: "youtube", name: "YouTube", capabilities: sessionCapabilities })} />
    );

    expect(screen.getByText(named(enLibrary.librarySource.connect.bodySession, "YouTube"))).toBeInTheDocument();
    expect(screen.getByLabelText(enComponents.sessionConnect.label)).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t("components:sessionConnect.warningTitle", { provider: "YouTube" }))
    ).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute("type", "submit");
    expect(buttons[0]).toBeDisabled();
    expect(connect.mutate).not.toHaveBeenCalled();
  });

  it("offers a reconnect of the session when the saved one expired", () => {
    render(
      <ConnectPrompt
        source={source({ provider: "youtube", name: "YouTube", capabilities: sessionCapabilities })}
        expired
      />
    );

    expect(screen.getByText(named(enLibrary.librarySource.connect.expiredTitle, "YouTube"))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: i18n.t("components:sessionConnect.reconnect", { provider: "YouTube" }) })
    ).toBeInTheDocument();
  });

  it("renders its words and no action for a connect kind this app does not know", () => {
    const unknownKind = {
      ...source().capabilities,
      connect: "carrier-pigeon",
    } as unknown as LibrarySourceDescription["capabilities"];

    render(<ConnectPrompt source={source({ name: "Future", capabilities: unknownKind })} />);

    expect(screen.getByText(named(enLibrary.librarySource.connect.title, "Future"))).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(enComponents.sessionConnect.label)).not.toBeInTheDocument();
  });
});
