import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_ACCESSIBILITY } from "@modules/accessibility";
import enAuth from "@modules/i18n/messages/en/auth.json";
import enComponents from "@modules/i18n/messages/en/components.json";

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

vi.mock("../SignInMethods", () => ({ SignInMethods: () => <div>methods</div> }));

import { SignInPanel } from "../SignInPanel";

describe("SignInPanel", () => {
  it("has one page heading and the methods", () => {
    render(<SignInPanel />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("methods")).toBeInTheDocument();
    expect(screen.getByText(enAuth.auth.login.noAccount)).toBeInTheDocument();
  });

  it("opens the accessibility panel from the footer", async () => {
    const user = userEvent.setup();
    render(<SignInPanel />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const control = screen.getByRole("button", { name: enComponents.accessibilityPanel.open });
    expect(control.closest("footer")).not.toBeNull();
    await user.click(control);

    expect(await screen.findByRole("dialog", { name: enComponents.accessibilityPanel.title })).toBeInTheDocument();
  });
});
