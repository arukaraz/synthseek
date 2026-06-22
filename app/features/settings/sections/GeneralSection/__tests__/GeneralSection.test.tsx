import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, createMockMutation } from "@test/mocks/trpc.mock";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn() }),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    auth: { me: { useQuery: () => createMockQuery({ language: "en" }) } },
  },
}));

vi.mock("@hooks/api/mutations/auth/useSetLanguage", () => ({
  useSetLanguage: () => createMockMutation(),
}));

vi.mock("@hooks/api/queries/useApiKeys", () => ({
  useApiKeys: () => createMockQuery([]),
}));

vi.mock("@hooks/api/queries/usePublicConfig", () => ({
  usePublicConfig: () => createMockQuery({ publicBaseUrl: null }),
}));

vi.mock("@hooks/api/mutations/api-keys/useCreateApiKey", () => ({
  useCreateApiKey: () => createMockMutation(),
}));

vi.mock("@hooks/api/mutations/api-keys/useRevokeApiKey", () => ({
  useRevokeApiKey: () => createMockMutation(),
}));

import { GeneralSection } from "../GeneralSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("GeneralSection", () => {
  it("composes the theme, language, and API cards under the page title", () => {
    render(<GeneralSection />);

    expect(screen.getByText(enSettings.general.pageTitle)).toBeInTheDocument();
    expect(screen.getByText(enSettings.general.theme.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.general.language.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.api.card.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.api.keys.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.mcp.title)).toBeInTheDocument();
  });
});
