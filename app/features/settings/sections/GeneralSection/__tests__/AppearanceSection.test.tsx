import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn() }),
}));

vi.mock("@hooks/api/mutations/auth/useSetLanguage", () => ({
  useSetLanguage: () => createMockMutation(),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({
    currentUser: { username: "arukaraz", language: "en", loudnessNormalization: true, loudnessPreampDb: 0 },
    isAdmin: true,
    isLoading: false,
  }),
}));

import { AppearanceSection } from "../AppearanceSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AppearanceSection", () => {
  it("composes the theme and language cards under the appearance page header", () => {
    render(<AppearanceSection />);

    expect(
      screen.getByRole("heading", { level: 1, name: enSettings.shell.pages.appearance.title })
    ).toBeInTheDocument();
    expect(screen.getByText(enSettings.general.theme.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.general.language.title)).toBeInTheDocument();
  });

  it("leaves the music apps, AI assistant and API key cards to the apps page", () => {
    render(<AppearanceSection />);

    expect(screen.queryByText(enSettings.subsonic.title)).not.toBeInTheDocument();
    expect(screen.queryByText(enSettings.mcp.title)).not.toBeInTheDocument();
    expect(screen.queryByText(enSettings.api.keys.title)).not.toBeInTheDocument();
  });
});
