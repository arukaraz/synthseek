import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface SettingsData {
  connections: { enrichment: unknown; spotify: unknown };
}

let settingsQuery: MockQueryResult<SettingsData | undefined> = createMockQuery<SettingsData | undefined>(undefined);
let isAdmin = true;

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin, currentUser: null, isLoading: false }),
}));

vi.mock("@features/discovery-integrations", () => ({
  DiscoveryCard: () => <div data-testid="discovery-card" />,
}));

vi.mock("../EnrichmentCard", () => ({
  EnrichmentCard: () => <div data-testid="enrichment-card" />,
}));

vi.mock("../LibrarySourcesCard", () => ({
  LibrarySourcesCard: () => <div data-testid="library-sources-card" />,
}));

import { MetadataSection } from "../MetadataSection";

const data: SettingsData = { connections: { enrichment: {}, spotify: {} } };

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  settingsQuery = createMockQuery<SettingsData | undefined>(undefined);
  isAdmin = true;
});

describe("MetadataSection", () => {
  it("renders the loading state", () => {
    settingsQuery = createLoadingQuery<SettingsData | undefined>();
    render(<MetadataSection />);
    expect(screen.getByText(enSettings.common.loading)).toBeInTheDocument();
  });

  it("renders the error state", () => {
    settingsQuery = createErrorQuery<SettingsData | undefined>(new Error("boom"));
    render(<MetadataSection />);
    expect(screen.getByText(enSettings.common.loadFailed)).toBeInTheDocument();
  });

  it("always renders the discovery card and shows the admin cards for admins", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<MetadataSection />);
    expect(screen.getByTestId("discovery-card")).toBeInTheDocument();
    expect(screen.getByTestId("enrichment-card")).toBeInTheDocument();
    expect(screen.getByTestId("library-sources-card")).toBeInTheDocument();
  });

  it("hides the admin cards for non-admins but keeps the discovery card", () => {
    isAdmin = false;
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<MetadataSection />);
    expect(screen.getByTestId("discovery-card")).toBeInTheDocument();
    expect(screen.queryByTestId("enrichment-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("library-sources-card")).not.toBeInTheDocument();
  });
});
