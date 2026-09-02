import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createLoadingQuery, createErrorQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface SettingsData {
  engine: {
    smartSearch: { customMoodKeywords: string[] };
    timeouts: unknown;
    queue: unknown;
    import: unknown;
    search: { banAfterFailedAttempts: number };
    wanted: unknown;
    quality: unknown;
  };
  connections: {
    slskd: { bannedUsers: string[] };
  };
  library: {
    recycleBin: unknown;
  };
}

let settingsQuery: MockQueryResult<SettingsData | undefined> = createMockQuery<SettingsData | undefined>(undefined);

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
}));

vi.mock("../SmartSearchCard", () => ({ SmartSearchCard: () => <div data-testid="smart-search-card" /> }));
vi.mock("../TimeoutsCard", () => ({ TimeoutsCard: () => <div data-testid="timeouts-card" /> }));
vi.mock("../QueueCard", () => ({ QueueCard: () => <div data-testid="queue-card" /> }));
vi.mock("../ImportCard", () => ({ ImportCard: () => <div data-testid="import-card" /> }));
vi.mock("../QuarantineCard", () => ({ QuarantineCard: () => <div data-testid="quarantine-card" /> }));
vi.mock("../WantedCard", () => ({ WantedCard: () => <div data-testid="wanted-card" /> }));
vi.mock("../QualityCard", () => ({ QualityCard: () => <div data-testid="quality-card" /> }));

import { EngineSection } from "../EngineSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  settingsQuery = createMockQuery<SettingsData | undefined>(undefined);
});

const data: SettingsData = {
  engine: {
    smartSearch: { customMoodKeywords: [] },
    timeouts: {},
    queue: {},
    import: {},
    search: { banAfterFailedAttempts: 0 },
    wanted: {},
    quality: {},
  },
  connections: {
    slskd: { bannedUsers: [] },
  },
  library: {
    recycleBin: {},
  },
};

describe("EngineSection", () => {
  it("renders the loading state", () => {
    settingsQuery = createLoadingQuery<SettingsData | undefined>();
    render(<EngineSection />);
    expect(screen.getByText(enSettings.header.loading)).toBeInTheDocument();
  });

  it("renders the error state with the error message", () => {
    settingsQuery = createErrorQuery<SettingsData | undefined>(new Error("boom"));
    render(<EngineSection />);
    expect(screen.getByText(enSettings.header.loadError.replace("{{message}}", "boom"))).toBeInTheDocument();
  });

  it("renders the unknown-error fallback when there is no data and no error", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(undefined);
    render(<EngineSection />);
    expect(
      screen.getByText(enSettings.header.loadError.replace("{{message}}", enSettings.header.unknownError))
    ).toBeInTheDocument();
  });

  it("renders the six engine cards when data is present, with quarantine now under Maintenance", () => {
    settingsQuery = createMockQuery<SettingsData | undefined>(data);
    render(<EngineSection />);
    expect(screen.getByTestId("smart-search-card")).toBeInTheDocument();
    expect(screen.getByTestId("timeouts-card")).toBeInTheDocument();
    expect(screen.getByTestId("queue-card")).toBeInTheDocument();
    expect(screen.getByTestId("import-card")).toBeInTheDocument();
    expect(screen.getByTestId("wanted-card")).toBeInTheDocument();
    expect(screen.getByTestId("quality-card")).toBeInTheDocument();
  });
});
