import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface SettingsData {
  connections: { plex: { url: string; token: string } };
  engine: { plexBehavior: unknown };
  formatting: unknown;
}

let settingsQuery: MockQueryResult<SettingsData | undefined> = createMockQuery<SettingsData | undefined>(undefined);

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
}));

vi.mock("../PlexIntegrationCard", () => ({
  PlexIntegrationCard: () => <div data-testid="plex-card" />,
}));

import { PlexSection } from "../PlexSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  settingsQuery = createMockQuery<SettingsData | undefined>(undefined);
});

describe("PlexSection", () => {
  it("renders the loading state", () => {
    settingsQuery = createLoadingQuery<SettingsData | undefined>();
    render(<PlexSection />);
    expect(screen.getByText(enSettings.common.loading)).toBeInTheDocument();
  });

  it("renders the error state", () => {
    settingsQuery = createErrorQuery<SettingsData | undefined>(new Error("boom"));
    render(<PlexSection />);
    expect(screen.getByText(enSettings.common.loadFailed)).toBeInTheDocument();
  });

  it("renders the plex card when data is present", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>({
      connections: { plex: { url: "", token: "" } },
      engine: { plexBehavior: {} },
      formatting: {},
    });
    render(<PlexSection />);
    expect(screen.getByTestId("plex-card")).toBeInTheDocument();
  });
});
