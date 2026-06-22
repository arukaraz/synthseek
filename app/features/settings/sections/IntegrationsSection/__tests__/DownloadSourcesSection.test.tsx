import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface SettingsData {
  connections: { slskd: { apiUrl: string; apiKey: string; bannedUsers: string[] } };
  engine: { search: unknown; timeouts: unknown };
  downloadSources: unknown;
}

let settingsQuery: MockQueryResult<SettingsData | undefined> = createMockQuery<SettingsData | undefined>(undefined);

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
}));

vi.mock("../SlskdCard", () => ({
  SlskdCard: () => <div data-testid="slskd-card" />,
}));

vi.mock("../YtdlpCard", () => ({
  YtdlpCard: () => <div data-testid="ytdlp-card" />,
}));

import { DownloadSourcesSection } from "../DownloadSourcesSection";

const data: SettingsData = {
  connections: { slskd: { apiUrl: "http://localhost:5030", apiKey: "k", bannedUsers: [] } },
  engine: { search: {}, timeouts: {} },
  downloadSources: {},
};

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  settingsQuery = createMockQuery<SettingsData | undefined>(undefined);
});

describe("DownloadSourcesSection", () => {
  it("renders the loading state", () => {
    settingsQuery = createLoadingQuery<SettingsData | undefined>();
    render(<DownloadSourcesSection />);
    expect(screen.getByText(enSettings.common.loading)).toBeInTheDocument();
  });

  it("renders the error state with the failure reason", () => {
    settingsQuery = createErrorQuery<SettingsData | undefined>(new Error("boom"));
    render(<DownloadSourcesSection />);
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it("renders both source cards when data is present", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<DownloadSourcesSection />);
    expect(screen.getByTestId("slskd-card")).toBeInTheDocument();
    expect(screen.getByTestId("ytdlp-card")).toBeInTheDocument();
  });
});
