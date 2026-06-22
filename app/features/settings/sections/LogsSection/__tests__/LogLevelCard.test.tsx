import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery, type MockMutationResult } from "@test/mocks/trpc.mock";
import { createMockSettings } from "@test/mocks/feature-hooks.mock";

type SettingsOutput = ReturnType<typeof createMockSettings>;

let settingsQuery = createMockQuery<SettingsOutput | undefined>(createMockSettings());
let updateLogLevel: MockMutationResult = createMockMutation();

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => settingsQuery,
}));

vi.mock("@hooks/api/mutations/settings/useUpdateLogLevel", () => ({
  useUpdateLogLevel: () => updateLogLevel,
}));

import { LogLevelCard } from "../LogLevelCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  settingsQuery = createMockQuery<SettingsOutput | undefined>(createMockSettings());
  updateLogLevel = createMockMutation();
});

describe("LogLevelCard", () => {
  it("renders the level card title", () => {
    render(<LogLevelCard />);
    expect(screen.getByText(enSettings.logs.level.title)).toBeInTheDocument();
  });

  it("shows the loading label while settings load", () => {
    settingsQuery = createMockQuery<SettingsOutput | undefined>(undefined, { isLoading: true });
    render(<LogLevelCard />);
    expect(screen.getByText(enSettings.logs.level.loading)).toBeInTheDocument();
  });

  it("checks the radio matching the current log level", () => {
    settingsQuery = createMockQuery<SettingsOutput | undefined>(
      createMockSettings({ system: { ...createMockSettings().system, logLevel: "WARN" } })
    );
    render(<LogLevelCard />);
    expect(screen.getByRole("radio", { name: enSettings.logs.level.options.warn })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("dispatches the chosen level through the mutation", async () => {
    render(<LogLevelCard />);
    await userEvent.click(screen.getByRole("radio", { name: enSettings.logs.level.options.debug }));
    expect(updateLogLevel.mutate).toHaveBeenCalledWith({ level: "DEBUG" });
  });

  it("disables the control while the mutation is pending", () => {
    updateLogLevel = createMockMutation({ isPending: true });
    render(<LogLevelCard />);
    expect(screen.getByRole("radio", { name: enSettings.logs.level.options.info })).toBeDisabled();
  });
});
