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

import { ThemeTab } from "../ThemeTab";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ThemeTab", () => {
  it("composes the theme and language cards without a page header of its own", () => {
    render(<ThemeTab />);

    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText(enSettings.general.theme.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.general.language.title)).toBeInTheDocument();
  });

  it("leaves the board to its own tab", () => {
    render(<ThemeTab />);

    expect(screen.queryByText(enSettings.general.board.title)).not.toBeInTheDocument();
  });
});
