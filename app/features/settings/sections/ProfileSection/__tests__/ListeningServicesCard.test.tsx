import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import enSettings from "@modules/i18n/messages/en/settings.json";

import type { ListeningConnectionView } from "../types";

interface State {
  connections: { data: ListeningConnectionView[] | undefined; isError: boolean };
  seen: string[] | undefined;
}

const state = vi.hoisted(
  (): State => ({
    connections: { data: undefined, isError: false },
    seen: undefined,
  })
);

vi.mock("@hooks/api", () => ({
  useListeningConnections: () => state.connections,
  useSeenPlaybackClients: () => ({ data: state.seen }),
}));

vi.mock("../components/ListeningServiceRow", () => ({
  ListeningServiceRow: ({
    connection,
    seenClients,
    children,
  }: {
    connection: ListeningConnectionView;
    seenClients: string[];
    children?: React.ReactNode;
  }) => (
    <div data-testid={`row-${connection.service}`} data-seen={seenClients.join(",")}>
      {children}
    </div>
  ),
}));

vi.mock("@features/discovery-integrations", () => ({
  DiscoveryFeeds: ({ service, apiKeyConfigured }: { service: string; apiKeyConfigured: boolean }) => (
    <div data-testid="feeds" data-service={service} data-api-key={String(apiKeyConfigured)} />
  ),
}));

import { ListeningServicesCard } from "../components/ListeningServicesCard";

const copy = enSettings.profile.listening;

function connection(overrides: Partial<ListeningConnectionView>): ListeningConnectionView {
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

beforeEach(() => {
  state.connections = {
    data: [
      connection({ service: "lastfm", configured: false }),
      connection({ service: "listenbrainz", configured: true }),
    ],
    isError: false,
  };
  state.seen = ["Feishin", "Symfonium"];
});

describe("ListeningServicesCard", () => {
  it("renders the card title", () => {
    render(<ListeningServicesCard />);
    expect(screen.getByRole("heading", { name: new RegExp(copy.title) })).toBeInTheDocument();
  });

  it("renders a row per connection, each with its discovery feeds", () => {
    render(<ListeningServicesCard />);
    const lastfm = within(screen.getByTestId("row-lastfm")).getByTestId("feeds");
    const listenbrainz = within(screen.getByTestId("row-listenbrainz")).getByTestId("feeds");
    expect(lastfm).toHaveAttribute("data-service", "lastfm");
    expect(listenbrainz).toHaveAttribute("data-service", "listenbrainz");
  });

  it("tells the feeds whether the service has its API key from the connection", () => {
    render(<ListeningServicesCard />);
    expect(within(screen.getByTestId("row-lastfm")).getByTestId("feeds")).toHaveAttribute("data-api-key", "false");
    expect(within(screen.getByTestId("row-listenbrainz")).getByTestId("feeds")).toHaveAttribute("data-api-key", "true");
  });

  it("hands every row the seen playback clients", () => {
    render(<ListeningServicesCard />);
    expect(screen.getByTestId("row-lastfm")).toHaveAttribute("data-seen", "Feishin,Symfonium");
  });

  it("hands the rows an empty client list until the clients load", () => {
    state.seen = undefined;
    render(<ListeningServicesCard />);
    expect(screen.getByTestId("row-listenbrainz")).toHaveAttribute("data-seen", "");
  });

  it("explains when the services could not be loaded", () => {
    state.connections = { data: undefined, isError: true };
    render(<ListeningServicesCard />);
    expect(screen.getByText(copy.unavailable)).toBeInTheDocument();
    expect(screen.queryByTestId("feeds")).not.toBeInTheDocument();
  });

  it("renders no rows and no error while loading", () => {
    state.connections = { data: undefined, isError: false };
    render(<ListeningServicesCard />);
    expect(screen.queryByText(copy.unavailable)).not.toBeInTheDocument();
    expect(screen.queryByTestId("feeds")).not.toBeInTheDocument();
  });
});
