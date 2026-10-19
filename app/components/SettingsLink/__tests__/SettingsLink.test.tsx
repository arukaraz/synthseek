import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

import { SettingsLink } from "../SettingsLink";

interface AuthState {
  currentUser: { username: string; avatar_url: string | null } | null;
  isAdmin: boolean;
}

interface VersionState {
  updateAvailable: boolean;
  latestVersion: string | null;
}

const auth = vi.hoisted((): { current: AuthState } => ({
  current: { currentUser: { username: "dan", avatar_url: null }, isAdmin: true },
}));
const version = vi.hoisted((): { current: VersionState } => ({
  current: { updateAvailable: false, latestVersion: null },
}));

vi.mock("@modules/providers/AuthProvider", () => ({ useAuthContext: () => auth.current }));
vi.mock("@hooks/api/subscriptions", () => ({ useVersionState: () => version.current }));

afterEach(() => {
  auth.current = { currentUser: { username: "dan", avatar_url: null }, isAdmin: true };
  version.current = { updateAvailable: false, latestVersion: null };
});

describe("SettingsLink", () => {
  it("sends an admin to the settings overview", () => {
    renderWithProviders(<SettingsLink variant="gear" />);

    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings/overview");
  });

  it("sends a member to their account, since the overview is admin only", () => {
    auth.current = { currentUser: { username: "ana", avatar_url: null }, isAdmin: false };
    renderWithProviders(<SettingsLink variant="gear" />);

    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings/account");
  });

  it("opens the settings menu from the phone's bottom bar, for admins and members alike", () => {
    renderWithProviders(<SettingsLink variant="avatar" />);
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");

    auth.current = { currentUser: { username: "ana", avatar_url: null }, isAdmin: false };
    renderWithProviders(<SettingsLink variant="avatar" />);
    expect(screen.getAllByRole("link", { name: "Settings" })[1]).toHaveAttribute("href", "/settings");
  });

  it("names the available version and shows the update badge", () => {
    version.current = { updateAvailable: true, latestVersion: "3.0.0" };
    renderWithProviders(<SettingsLink variant="gear" />);

    expect(screen.getByRole("link", { name: "Settings, version 3.0.0 available" })).toBeInTheDocument();
    expect(screen.getByText("Update available")).toBeInTheDocument();
  });

  it("renders the user's avatar in the avatar variant", () => {
    renderWithProviders(<SettingsLink variant="avatar" />);

    expect(screen.getByRole("link")).toHaveTextContent("D");
  });

  it("renders nothing when nobody is signed in", () => {
    auth.current = { currentUser: null, isAdmin: false };
    const { container } = renderWithProviders(<SettingsLink variant="gear" />);

    expect(container).toBeEmptyDOMElement();
  });
});
