import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { renderWithProviders, screen, waitFor } from "@test/test-utils";

import { UserAvatarMenu } from "../UserAvatarMenu";

const authState = vi.hoisted(() => ({
  currentUser: {
    id: "user_1",
    username: "ada",
    email: "ada@example.com",
    role: "admin",
    avatar_url: null,
  } as {
    id: string;
    username: string;
    email: string;
    role: string;
    avatar_url: string | null;
  } | null,
  isAdmin: true,
}));

const versionState = vi.hoisted(() => ({
  updateAvailable: false,
  latestVersion: null as string | null,
  currentVersion: "1.0.0",
}));

const logoutState = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue(undefined),
  isPending: false,
}));

const replaceMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: authState.currentUser, isAdmin: authState.isAdmin }),
}));

vi.mock("@hooks/api/subscriptions", () => ({
  useVersionState: () => versionState,
}));

vi.mock("@hooks/api/mutations/auth/useLogout", () => ({
  useLogout: () => logoutState,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
}));

describe("UserAvatarMenu", () => {
  beforeEach(() => {
    authState.currentUser = {
      id: "user_1",
      username: "ada",
      email: "ada@example.com",
      role: "admin",
      avatar_url: null,
    };
    authState.isAdmin = true;
    versionState.updateAvailable = false;
    versionState.latestVersion = null;
    versionState.currentVersion = "1.0.0";
    logoutState.isPending = false;
    logoutState.mutateAsync = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when there is no current user", () => {
    authState.currentUser = null;

    const { container } = renderWithProviders(<UserAvatarMenu />);

    expect(container).toBeEmptyDOMElement();
  });

  it("opens the menu and shows the members item for admins", async () => {
    const { user } = renderWithProviders(<UserAvatarMenu />);

    await user.click(screen.getByLabelText("User menu"));

    expect(await screen.findByText("Members")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("hides the members item for non-admins", async () => {
    authState.isAdmin = false;

    const { user } = renderWithProviders(<UserAvatarMenu />);

    await user.click(screen.getByLabelText("User menu"));

    await screen.findByText("Settings");
    expect(screen.queryByText("Members")).not.toBeInTheDocument();
  });

  it("navigates to settings when the settings item is selected", async () => {
    const { user } = renderWithProviders(<UserAvatarMenu />);

    await user.click(screen.getByLabelText("User menu"));
    await user.click(await screen.findByText("Settings"));

    expect(pushMock).toHaveBeenCalledWith("/settings/general");
  });

  it("logs out and replaces the route with the login page", async () => {
    const { user } = renderWithProviders(<UserAvatarMenu />);

    await user.click(screen.getByLabelText("User menu"));
    await user.click(await screen.findByText("Logout"));

    await waitFor(() => expect(logoutState.mutateAsync).toHaveBeenCalled());
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
  });

  it("navigates to the profile when the profile item is selected", async () => {
    const { user } = renderWithProviders(<UserAvatarMenu />);

    await user.click(screen.getByLabelText("User menu"));
    await user.click(await screen.findByText("Profile"));

    expect(pushMock).toHaveBeenCalledWith("/settings/profile");
  });

  it("navigates to the members page when the members item is selected", async () => {
    const { user } = renderWithProviders(<UserAvatarMenu />);

    await user.click(screen.getByLabelText("User menu"));
    await user.click(await screen.findByText("Members"));

    expect(pushMock).toHaveBeenCalledWith("/settings/members");
  });

  it("shows the signing-out state and does not re-trigger logout while pending", async () => {
    logoutState.isPending = true;

    const { user } = renderWithProviders(<UserAvatarMenu />);

    await user.click(screen.getByLabelText("User menu"));

    expect(await screen.findByText("Signing out...")).toBeInTheDocument();
  });

  it("surfaces the update section when an update is available", async () => {
    versionState.updateAvailable = true;
    versionState.latestVersion = "2.0.0";

    const { user } = renderWithProviders(<UserAvatarMenu />);

    await user.click(screen.getByLabelText("User menu"));

    expect(await screen.findByText("Update to 2.0.0")).toBeInTheDocument();
  });
});
