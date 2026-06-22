import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface SettingsData {
  connections: { lidarr: { url: string; apiKey: string } };
}

let settingsQuery: MockQueryResult<SettingsData | undefined> = createMockQuery<SettingsData | undefined>(undefined);

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
}));

vi.mock("../LidarrCard", () => ({
  LidarrCard: () => <div data-testid="lidarr-card" />,
}));

import { LidarrSection } from "../LidarrSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  settingsQuery = createMockQuery<SettingsData | undefined>(undefined);
});

describe("LidarrSection", () => {
  it("renders the loading state", () => {
    settingsQuery = createLoadingQuery<SettingsData | undefined>();
    render(<LidarrSection />);
    expect(screen.getByText(enSettings.common.loading)).toBeInTheDocument();
  });

  it("renders the error state with the failure reason", () => {
    settingsQuery = createErrorQuery<SettingsData | undefined>(new Error("boom"));
    render(<LidarrSection />);
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it("renders the lidarr card when data is present", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>({
      connections: { lidarr: { url: "", apiKey: "" } },
    });
    render(<LidarrSection />);
    expect(screen.getByTestId("lidarr-card")).toBeInTheDocument();
  });
});
