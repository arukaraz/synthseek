import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface SettingsData {
  connections: { spotify: unknown; enrichment: unknown };
}

let settingsQuery: MockQueryResult<SettingsData | undefined> = createMockQuery<SettingsData | undefined>(undefined);

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
}));

vi.mock("../SpotifySourceCard", () => ({
  SpotifySourceCard: () => <div data-testid="spotify-source-card" />,
}));

import { LibrarySourcesSection } from "../LibrarySourcesSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  settingsQuery = createMockQuery<SettingsData | undefined>(undefined);
});

describe("LibrarySourcesSection", () => {
  it("renders the loading state", () => {
    settingsQuery = createLoadingQuery<SettingsData | undefined>();
    render(<LibrarySourcesSection />);
    expect(screen.getByText(enSettings.common.loading)).toBeInTheDocument();
  });

  it("renders the error state with the failure reason", () => {
    settingsQuery = createErrorQuery<SettingsData | undefined>(new Error("boom"));
    render(<LibrarySourcesSection />);
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it("renders the library sources card when data is present", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>({ connections: { spotify: {}, enrichment: {} } });
    render(<LibrarySourcesSection />);
    expect(screen.getByTestId("spotify-source-card")).toBeInTheDocument();
  });
});
