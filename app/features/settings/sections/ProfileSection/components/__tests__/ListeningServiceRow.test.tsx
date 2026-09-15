import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import enSettings from "@modules/i18n/messages/en/settings.json";

interface Mutation {
  mutate: Mock<(input?: unknown) => void>;
  isPending: boolean;
}

const api = vi.hoisted(() => ({
  beginLastfm: { mutate: vi.fn(), isPending: false } as Mutation,
  completeLastfm: { mutate: vi.fn(), isPending: false } as Mutation,
  connectListenBrainz: { mutate: vi.fn(), isPending: false } as Mutation,
  disconnect: { mutate: vi.fn(), isPending: false } as Mutation,
  setEnabled: { mutate: vi.fn(), isPending: false } as Mutation,
  setRelayed: { mutate: vi.fn(), isPending: false } as Mutation,
  authorizationUrl: "https://last.fm/api/auth?token=abc",
}));

vi.mock("@hooks/api", () => ({
  useBeginLastfmAuthorization: () => ({
    isPending: api.beginLastfm.isPending,
    mutate: (input: unknown, options?: { onSuccess?: (result: { authorizationUrl: string }) => void }) => {
      api.beginLastfm.mutate(input);
      options?.onSuccess?.({ authorizationUrl: api.authorizationUrl });
    },
  }),
  useCompleteLastfmAuthorization: () => api.completeLastfm,
  useConnectListenBrainz: () => ({
    isPending: api.connectListenBrainz.isPending,
    mutate: (input: unknown, options?: { onSuccess?: () => void }) => {
      api.connectListenBrainz.mutate(input);
      options?.onSuccess?.();
    },
  }),
  useDisconnectListeningService: () => api.disconnect,
  useSetScrobbleEnabled: () => api.setEnabled,
  useSetRelayedClients: () => api.setRelayed,
}));

import { ListeningServiceRow } from "../ListeningServiceRow";
import type { ListeningServiceRowProps } from "../../types";

function connection(
  overrides: Partial<ListeningServiceRowProps["connection"]> = {}
): ListeningServiceRowProps["connection"] {
  return {
    service: "lastfm",
    connected: false,
    configured: true,
    externalUsername: null,
    scrobbleEnabled: false,
    relayedClients: [],
    lastFailure: null,
    ...overrides,
  };
}

function renderRow(overrides: Partial<ListeningServiceRowProps> = {}) {
  render(
    <ListeningServiceRow connection={overrides.connection ?? connection()} seenClients={overrides.seenClients ?? []} />
  );
  return { user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  api.beginLastfm.isPending = false;
  api.completeLastfm.isPending = false;
  api.connectListenBrainz.isPending = false;
  api.disconnect.isPending = false;
});

describe("what the row says about a service", () => {
  it("names the service", () => {
    renderRow();

    expect(screen.getByText(enSettings.profile.listening.lastfm.name)).toBeInTheDocument();
  });

  it("says an unconfigured service needs the administrator first", () => {
    renderRow({ connection: connection({ configured: false }) });

    expect(screen.getByText(enSettings.profile.listening.notConfigured)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.profile.connected.connect })).toBeDisabled();
  });

  it("says a configured service is merely not connected yet", () => {
    renderRow();

    expect(screen.getByText(enSettings.profile.listening.notConnected)).toBeInTheDocument();
  });

  it("shows the account name a connected service reported", () => {
    renderRow({ connection: connection({ connected: true, externalUsername: "arukaraz" }) });

    expect(screen.getByText("arukaraz")).toBeInTheDocument();
  });

  it("falls back to saying it is connected when the service named no account", () => {
    renderRow({ connection: connection({ connected: true }) });

    expect(screen.getByText(enSettings.profile.listening.connected)).toBeInTheDocument();
  });

  it("shows why the last scrobble did not land", () => {
    renderRow({ connection: connection({ connected: true, lastFailure: "unauthorized" }) });

    expect(screen.getByText(enSettings.profile.listening.failure.unauthorized)).toBeInTheDocument();
  });
});

describe("connecting Last.fm", () => {
  it("sends the listener to Last.fm in a tab of its own", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { user } = renderRow();

    await user.click(screen.getByRole("button", { name: enSettings.profile.connected.connect }));

    expect(open).toHaveBeenCalledWith(api.authorizationUrl, "_blank", "noopener,noreferrer");
    open.mockRestore();
  });

  it("asks the listener to come back and finish once they have authorized", async () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    const { user } = renderRow();

    await user.click(screen.getByRole("button", { name: enSettings.profile.connected.connect }));

    expect(screen.getByText(enSettings.profile.listening.lastfm.authorizeHint)).toBeInTheDocument();
  });

  it("finishes the exchange when the listener says they are done", async () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    const { user } = renderRow();
    await user.click(screen.getByRole("button", { name: enSettings.profile.connected.connect }));

    await user.click(screen.getByRole("button", { name: enSettings.profile.listening.lastfm.finish }));

    expect(api.completeLastfm.mutate).toHaveBeenCalled();
  });

  it("shows no token box, since Last.fm is authorized rather than pasted", () => {
    renderRow();

    expect(screen.queryByLabelText(enSettings.profile.listening.listenbrainz.tokenLabel)).not.toBeInTheDocument();
  });
});

describe("connecting ListenBrainz", () => {
  const listenbrainz = connection({ service: "listenbrainz" });

  it("asks for a token rather than sending the listener anywhere", () => {
    renderRow({ connection: listenbrainz });

    expect(screen.getByLabelText(enSettings.profile.listening.listenbrainz.tokenLabel)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enSettings.profile.connected.connect })).toBeDisabled();
  });

  it("connects with the token the listener pasted", async () => {
    const { user } = renderRow({ connection: listenbrainz });

    await user.type(screen.getByLabelText(enSettings.profile.listening.listenbrainz.tokenLabel), "secret-token");
    await user.click(screen.getByRole("button", { name: enSettings.profile.connected.connect }));

    expect(api.connectListenBrainz.mutate).toHaveBeenCalledWith({ token: "secret-token" });
  });

  it("clears the token box once it has been accepted", async () => {
    const { user } = renderRow({ connection: listenbrainz });
    const box = screen.getByLabelText(enSettings.profile.listening.listenbrainz.tokenLabel);

    await user.type(box, "secret-token");
    await user.click(screen.getByRole("button", { name: enSettings.profile.connected.connect }));

    expect(box).toHaveValue("");
  });

  it("keeps the connect button out of reach for a token that is only spaces", async () => {
    const { user } = renderRow({ connection: listenbrainz });

    await user.type(screen.getByLabelText(enSettings.profile.listening.listenbrainz.tokenLabel), "   ");

    expect(screen.getByRole("button", { name: enSettings.profile.connected.connect })).toBeDisabled();
  });
});

describe("a service that is already connected", () => {
  const connected = connection({ connected: true, scrobbleEnabled: true, externalUsername: "arukaraz" });

  it("offers to disconnect it", async () => {
    const { user } = renderRow({ connection: connected });

    await user.click(screen.getByRole("button", { name: enSettings.profile.connected.disconnect }));

    expect(api.disconnect.mutate).toHaveBeenCalledWith({ service: "lastfm" });
  });

  it("keeps every button out of reach while a request is in flight", () => {
    api.disconnect.isPending = true;

    renderRow({ connection: connected });

    expect(screen.getByRole("button", { name: enSettings.profile.connected.disconnect })).toBeDisabled();
  });

  it("turns the sending of plays on and off", async () => {
    const { user } = renderRow({ connection: connected });

    await user.click(screen.getByRole("switch", { name: enSettings.profile.listening.sendPlays }));

    expect(api.setEnabled.mutate).toHaveBeenCalledWith({ service: "lastfm", enabled: false });
  });

  it("lists nothing about other apps until one has been seen", () => {
    renderRow({ connection: connected });

    expect(screen.queryByText(enSettings.profile.listening.otherApps)).not.toBeInTheDocument();
  });

  it("offers to relay the plays of another app that has been seen", async () => {
    const { user } = renderRow({ connection: connected, seenClients: ["Rhythmbox", "Sonixd"] });

    await user.click(screen.getByRole("checkbox", { name: "Rhythmbox" }));

    expect(api.setRelayed.mutate).toHaveBeenCalledWith({ service: "lastfm", clients: ["Rhythmbox"] });
  });

  it("stops relaying an app the listener unticked", async () => {
    const { user } = renderRow({
      connection: connection({ connected: true, relayedClients: ["Rhythmbox", "Sonixd"] }),
      seenClients: ["Rhythmbox", "Sonixd"],
    });

    await user.click(screen.getByRole("checkbox", { name: "Rhythmbox" }));

    expect(api.setRelayed.mutate).toHaveBeenCalledWith({ service: "lastfm", clients: ["Sonixd"] });
  });
});
