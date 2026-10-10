import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

let isAdmin = false;

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin, currentUser: null, isLoading: false }),
}));

vi.mock("../components/NotificationDestinations", () => ({
  NotificationDestinations: () => <div data-testid="destinations" />,
}));

vi.mock("../components/MemberNtfyServerCard", () => ({
  MemberNtfyServerCard: () => <div data-testid="member-server" />,
}));

import { NotificationsSection } from "../NotificationsSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  isAdmin = false;
});

describe("NotificationsSection", () => {
  it("gives everyone the page and their destinations", () => {
    render(<NotificationsSection />);

    expect(screen.getByRole("heading", { name: enSettings.notifications.pageTitle })).toBeInTheDocument();
    expect(screen.getByTestId("destinations")).toBeInTheDocument();
    expect(screen.queryByTestId("member-server")).not.toBeInTheDocument();
  });

  it("adds the members' ntfy server card for an admin", () => {
    isAdmin = true;
    render(<NotificationsSection />);

    expect(screen.getByTestId("member-server")).toBeInTheDocument();
  });
});
