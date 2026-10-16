import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface SettingsData {
  connections: { enrichment: { musicbrainzEmail: string }; spotify: unknown };
}

let settingsQuery: MockQueryResult<SettingsData | undefined> = createMockQuery<SettingsData | undefined>(undefined);

const enrichmentCard = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
}));

vi.mock("@features/discovery-integrations", () => ({
  DiscoveryFeeds: () => <div data-testid="discovery-feeds" />,
}));

vi.mock("../EnrichmentCard", () => ({
  EnrichmentCard: (props: { initial: unknown }) => {
    enrichmentCard(props);
    return <div data-testid="enrichment-card" />;
  },
}));

vi.mock("../SpotifySourceCard", () => ({
  SpotifySourceCard: () => <div data-testid="spotify-source-card" />,
}));

import { MetadataSection } from "../MetadataSection";

const data: SettingsData = { connections: { enrichment: { musicbrainzEmail: "me@example.com" }, spotify: {} } };

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  settingsQuery = createMockQuery<SettingsData | undefined>(undefined);
});

describe("MetadataSection", () => {
  it("renders the loading state under the page header", () => {
    settingsQuery = createLoadingQuery<SettingsData | undefined>();
    render(<MetadataSection />);
    expect(screen.getByRole("heading", { level: 1, name: enSettings.shell.pages.metadata.title })).toBeInTheDocument();
    expect(screen.getByText(enSettings.common.loading)).toBeInTheDocument();
    expect(screen.queryByTestId("enrichment-card")).not.toBeInTheDocument();
  });

  it("renders the error state under the page header", () => {
    settingsQuery = createErrorQuery<SettingsData | undefined>(new Error("boom"));
    render(<MetadataSection />);
    expect(screen.getByRole("heading", { level: 1, name: enSettings.shell.pages.metadata.title })).toBeInTheDocument();
    expect(screen.getByText(enSettings.common.loadFailed)).toBeInTheDocument();
    expect(screen.queryByTestId("enrichment-card")).not.toBeInTheDocument();
  });

  it("renders the page header and hands the stored enrichment settings to the enrichment card", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<MetadataSection />);
    expect(screen.getByRole("heading", { level: 1, name: enSettings.shell.pages.metadata.title })).toBeInTheDocument();
    expect(screen.getByTestId("enrichment-card")).toBeInTheDocument();
    expect(enrichmentCard).toHaveBeenCalledWith({ initial: data.connections.enrichment });
  });

  it("leaves the library sources to their own tab", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<MetadataSection />);
    expect(screen.queryByTestId("spotify-source-card")).not.toBeInTheDocument();
  });

  it("leaves the discovery feeds to the listening page", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<MetadataSection />);
    expect(screen.queryByTestId("discovery-feeds")).not.toBeInTheDocument();
  });
});
