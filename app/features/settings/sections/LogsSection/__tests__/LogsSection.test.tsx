import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery } from "@test/mocks/trpc.mock";
import { createMockLogEntry, createMockSettings } from "@test/mocks/feature-hooks.mock";

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => createMockQuery(createMockSettings()),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateLogLevel", () => ({
  useUpdateLogLevel: () => createMockMutation(),
}));

vi.mock("@hooks/api/queries/useLogTail", () => ({
  useLogTail: () => createMockQuery({ file: "synthseek.log", entries: [createMockLogEntry()] }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@utils/download", () => ({
  triggerDownload: vi.fn().mockResolvedValue(undefined),
  downloadText: vi.fn(),
}));

import { LogsSection } from "../LogsSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LogsSection", () => {
  it("composes the page header and the three log cards", () => {
    render(<LogsSection />);

    expect(screen.getByRole("heading", { level: 1, name: enSettings.logs.page.title })).toBeInTheDocument();
    expect(screen.getByText(enSettings.logs.level.title)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: enSettings.logs.viewer.title })).toBeInTheDocument();
    expect(screen.getByText(enSettings.logs.export.title)).toBeInTheDocument();
  });
});
