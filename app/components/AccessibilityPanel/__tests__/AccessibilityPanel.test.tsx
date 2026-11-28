import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enComponents from "@modules/i18n/messages/en/components.json";
import enSettings from "@modules/i18n/messages/en/settings.json";
import { DEFAULT_ACCESSIBILITY } from "@modules/accessibility";

import { AccessibilityPanel } from "../AccessibilityPanel";

const copy = enComponents.accessibilityPanel;

vi.mock("@modules/providers/AccessibilityProvider", () => ({
  useAccessibility: () => ({
    ...DEFAULT_ACCESSIBILITY,
    motionReduced: false,
    transparencyReduced: false,
    moreContrast: false,
    signedIn: false,
    update: vi.fn(),
  }),
}));

beforeEach(async () => {
  await i18n.changeLanguage("en");
});

describe("AccessibilityPanel", () => {
  it("opens a dialog with the guest controls from its button", async () => {
    const user = userEvent.setup();
    render(<AccessibilityPanel />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: copy.open }));

    const dialog = await screen.findByRole("dialog", { name: copy.title });
    expect(dialog).toHaveAccessibleDescription(copy.description);
    expect(screen.getByRole("switch", { name: enSettings.accessibility.mode.label })).toBeInTheDocument();
    expect(screen.getAllByRole("radiogroup")).toHaveLength(3);
  });

  it("returns focus to its button when closed", async () => {
    const user = userEvent.setup();
    render(<AccessibilityPanel />);
    const trigger = screen.getByRole("button", { name: copy.open });

    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
