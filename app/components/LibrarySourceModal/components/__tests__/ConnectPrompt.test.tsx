import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import type { LibrarySourceDescription } from "@hooks/api/queries/library-source/types";
import enLibrary from "@modules/i18n/messages/en/library.json";

const connect = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));

vi.mock("@hooks/api/mutations/library-source/useConnectLibrarySource", () => ({
  useConnectLibrarySource: () => connect,
}));

import { ConnectPrompt } from "../ConnectPrompt";

function source(overrides: Partial<LibrarySourceDescription> = {}): LibrarySourceDescription {
  return {
    provider: "spotify",
    name: "Spotify",
    configured: true,
    connected: false,
    pending: false,
    externalUsername: null,
    capabilities: {
      connect: "oauth",
      itemTypes: ["playlist", "album", "liked"],
      watch: { playlists: true, savedAlbums: true },
      streamsAudio: false,
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

  it("sends an account-linked source to the profile instead of starting an authorization", () => {
    render(
      <ConnectPrompt
        source={source({
          name: "Navidrome",
          capabilities: {
            connect: "account",
            itemTypes: ["playlist"],
            watch: { playlists: true, savedAlbums: false },
            streamsAudio: true,
          },
        })}
      />
    );

    expect(screen.getByText(named(enLibrary.librarySource.connect.bodyAccount, "Navidrome"))).toBeInTheDocument();
    const link = screen.getByRole("link", { name: named(enLibrary.librarySource.connect.linkAccount, "Navidrome") });
    expect(link).toHaveAttribute("href", "/settings/profile");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(connect.mutate).not.toHaveBeenCalled();
  });
});
