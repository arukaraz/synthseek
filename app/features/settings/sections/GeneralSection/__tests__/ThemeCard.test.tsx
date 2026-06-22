import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

const setTheme = vi.fn();
let currentTheme = "dark";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: currentTheme, setTheme }),
}));

import { ThemeCard } from "../ThemeCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  currentTheme = "dark";
});

describe("ThemeCard", () => {
  it("renders the theme card title and description", () => {
    render(<ThemeCard />);

    expect(screen.getByText(enSettings.general.theme.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.general.theme.description)).toBeInTheDocument();
  });

  it("marks the resolved theme as selected once mounted", () => {
    currentTheme = "ocean";
    render(<ThemeCard />);

    expect(screen.getByRole("radio", { name: "Ocean" })).toBeChecked();
  });

  it("forwards a click selection to setTheme", async () => {
    render(<ThemeCard />);

    await userEvent.click(screen.getByRole("radio", { name: "Midnight" }));

    expect(setTheme).toHaveBeenCalledWith("midnight");
  });
});
