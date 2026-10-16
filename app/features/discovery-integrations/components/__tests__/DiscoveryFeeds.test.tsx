import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import enLibrary from "@modules/i18n/messages/en/library.json";

interface ConfigStub {
  integrations: { lastfm: { marker: string }; listenbrainz: { marker: string } };
}

interface QueryStub {
  data: ConfigStub | undefined;
  isLoading: boolean;
  error: Error | null;
}

const state = vi.hoisted((): { query: QueryStub } => ({
  query: { data: undefined, isLoading: false, error: null },
}));

vi.mock("@hooks/api/queries/discovery/useDiscoveryConfig", () => ({
  useDiscoveryConfig: () => state.query,
}));

vi.mock("../LastfmCard", () => ({
  LastfmCard: ({ config, apiKeyConfigured }: { config: { marker: string }; apiKeyConfigured: boolean }) => (
    <div data-testid="lastfm-card" data-config={config.marker} data-api-key={String(apiKeyConfigured)} />
  ),
}));

vi.mock("../ListenBrainzCard", () => ({
  ListenBrainzCard: ({ config }: { config: { marker: string } }) => (
    <div data-testid="listenbrainz-card" data-config={config.marker} />
  ),
}));

import { DiscoveryFeeds } from "../DiscoveryFeeds";

const copy = enLibrary.discoveryIntegrations.card;

const loaded: ConfigStub = { integrations: { lastfm: { marker: "lfm" }, listenbrainz: { marker: "lb" } } };

beforeEach(() => {
  state.query = { data: loaded, isLoading: false, error: null };
});

describe("DiscoveryFeeds", () => {
  it("shows a loading line while the config loads", () => {
    state.query = { data: undefined, isLoading: true, error: null };
    render(<DiscoveryFeeds service="lastfm" apiKeyConfigured />);
    expect(screen.getByText(copy.loading)).toBeInTheDocument();
    expect(screen.queryByText(copy.loadError)).not.toBeInTheDocument();
    expect(screen.queryByTestId("lastfm-card")).not.toBeInTheDocument();
  });

  it("shows the load error when the config fails", () => {
    state.query = { data: undefined, isLoading: false, error: new Error("down") };
    render(<DiscoveryFeeds service="listenbrainz" apiKeyConfigured={false} />);
    expect(screen.getByText(copy.loadError)).toBeInTheDocument();
    expect(screen.queryByTestId("listenbrainz-card")).not.toBeInTheDocument();
  });

  it("shows the load error when the config is empty", () => {
    state.query = { data: undefined, isLoading: false, error: null };
    render(<DiscoveryFeeds service="lastfm" apiKeyConfigured />);
    expect(screen.getByText(copy.loadError)).toBeInTheDocument();
  });

  it("renders the Last.fm feeds with their config and key state", () => {
    render(<DiscoveryFeeds service="lastfm" apiKeyConfigured={false} />);
    const card = screen.getByTestId("lastfm-card");
    expect(card).toHaveAttribute("data-config", "lfm");
    expect(card).toHaveAttribute("data-api-key", "false");
    expect(screen.queryByTestId("listenbrainz-card")).not.toBeInTheDocument();
  });

  it("passes a configured key through to the Last.fm feeds", () => {
    render(<DiscoveryFeeds service="lastfm" apiKeyConfigured />);
    expect(screen.getByTestId("lastfm-card")).toHaveAttribute("data-api-key", "true");
  });

  it("renders the ListenBrainz feeds with their config", () => {
    render(<DiscoveryFeeds service="listenbrainz" apiKeyConfigured />);
    expect(screen.getByTestId("listenbrainz-card")).toHaveAttribute("data-config", "lb");
    expect(screen.queryByTestId("lastfm-card")).not.toBeInTheDocument();
  });
});
