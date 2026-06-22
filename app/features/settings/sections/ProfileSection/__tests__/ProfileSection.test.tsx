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
vi.mock("../components/ConnectedAccountsCard", () => ({
  ConnectedAccountsCard: () => <div data-testid="connected-card" />,
}));

import { ProfileSection } from "../ProfileSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  authUser = createMockUser();
});

describe("ProfileSection", () => {
  it("renders the page header and all four profile cards", () => {
    render(<ProfileSection />);
    expect(screen.getByRole("heading", { name: enSettings.profile.pageTitle })).toBeInTheDocument();
    expect(screen.getByTestId("account-card")).toBeInTheDocument();
    expect(screen.getByTestId("edit-card")).toBeInTheDocument();
    expect(screen.getByTestId("password-card")).toBeInTheDocument();
    expect(screen.getByTestId("connected-card")).toBeInTheDocument();
  });

  it("renders nothing when there is no current user", () => {
    authUser = null;
    const { container } = render(<ProfileSection />);
    expect(container).toBeEmptyDOMElement();
  });
});
