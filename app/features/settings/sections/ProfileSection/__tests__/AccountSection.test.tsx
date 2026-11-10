import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockUser } from "@test/mocks/feature-hooks.mock";

type AuthUser = ReturnType<typeof createMockUser> | null;
let authUser: AuthUser = createMockUser();

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: authUser, isAdmin: false, isLoading: false }),
}));

vi.mock("../components/AccountCard", () => ({ AccountCard: () => <div data-testid="account-card" /> }));
vi.mock("../components/EditProfileCard", () => ({ EditProfileCard: () => <div data-testid="edit-card" /> }));
vi.mock("../components/ChangePasswordCard", () => ({ ChangePasswordCard: () => <div data-testid="password-card" /> }));
vi.mock("../components/QuotaCard", () => ({ QuotaCard: () => <div data-testid="quota-card" /> }));
vi.mock("../components/MyRequestPresetCard", () => ({
  MyRequestPresetCard: () => <div data-testid="request-preset-card" />,
}));
vi.mock("../components/HouseholdSharingCard", () => ({
  HouseholdSharingCard: () => <div data-testid="household-card" />,
}));

import { AccountSection } from "../AccountSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  authUser = createMockUser();
});

describe("AccountSection", () => {
  it("renders the page header and the account, quota, request preset, profile and password cards", () => {
    render(<AccountSection />);
    expect(screen.getByRole("heading", { name: enSettings.shell.pages.account.title })).toBeInTheDocument();
    expect(screen.getByTestId("account-card")).toBeInTheDocument();
    expect(screen.getByTestId("quota-card")).toBeInTheDocument();
    expect(screen.getByTestId("request-preset-card")).toBeInTheDocument();
    expect(screen.getByTestId("edit-card")).toBeInTheDocument();
    expect(screen.getByTestId("password-card")).toBeInTheDocument();
    expect(screen.getByTestId("household-card")).toBeInTheDocument();
  });

  it("puts the profile editor right under the profile, then quota and request preset side by side in one row", () => {
    render(<AccountSection />);
    const order = Array.from(document.querySelectorAll("[data-testid]")).map((node) =>
      node.getAttribute("data-testid")
    );
    expect(order.slice(0, 4)).toEqual(["account-card", "edit-card", "quota-card", "request-preset-card"]);
    const quotaRow = screen.getByTestId("quota-card").parentElement;
    expect(quotaRow).toBe(screen.getByTestId("request-preset-card").parentElement);
    expect(quotaRow?.className).toContain("lg:grid-cols-2");
  });

  it("renders nothing when there is no current user", () => {
    authUser = null;
    const { container } = render(<AccountSection />);
    expect(container).toBeEmptyDOMElement();
  });
});
