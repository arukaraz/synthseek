import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { expectNoAxeViolations } from "@test/a11y/axe";
import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";
import { DEFAULT_ACCESSIBILITY } from "@modules/accessibility";

import { AccessibilitySection } from "../AccessibilitySection";

const copy = enSettings.accessibility;

vi.mock("@modules/providers/AccessibilityProvider", () => ({
  useAccessibility: () => ({
    ...DEFAULT_ACCESSIBILITY,
    motionReduced: false,
    transparencyReduced: false,
    moreContrast: false,
    signedIn: true,
    update: vi.fn(),
  }),
}));

beforeEach(async () => {
  await i18n.changeLanguage("en");
});

describe("AccessibilitySection", () => {
  it("titles the page and lists its controls in one card", () => {
    render(<AccessibilitySection />);

    expect(screen.getByRole("heading", { name: enSettings.shell.pages.accessibility.title })).toBeInTheDocument();
    const card = screen.getByRole("region", { name: enSettings.shell.pages.accessibility.title });
    expect(card).toContainElement(screen.getByRole("switch", { name: copy.mode.label }));
    expect(card).toContainElement(screen.getByRole("switch", { name: copy.shortcuts.label }));
    expect(screen.getAllByRole("radiogroup")).toHaveLength(3);
  });

  it("has no save bar", () => {
    render(<AccessibilitySection />);

    expect(screen.queryByRole("button", { name: /save|discard/i })).not.toBeInTheDocument();
  });

  it("has no axe violation", async () => {
    render(<AccessibilitySection />);

    await expectNoAxeViolations();
  });
});
