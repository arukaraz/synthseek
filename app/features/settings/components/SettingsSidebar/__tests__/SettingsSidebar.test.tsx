import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

let pathname = "/settings/general";
let isAdmin = true;

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin, currentUser: null, isLoading: false }),
}));

import { SettingsSidebar } from "../SettingsSidebar";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  pathname = "/settings/general";
  isAdmin = true;
});

describe("SettingsSidebar", () => {
  it("renders the navigation landmark and the build version footer", () => {
    render(<SettingsSidebar />);

    expect(screen.getByRole("navigation", { name: enSettings.shell.sidebar.ariaLabel })).toBeInTheDocument();
    expect(screen.getByText(/synthseek v/i)).toBeInTheDocument();
  });

  it("shows admin-only items for an administrator", () => {
    render(<SettingsSidebar />);

    expect(screen.getByText(enSettings.shell.sidebar.items.members)).toBeInTheDocument();
    expect(screen.getByText(enSettings.shell.sidebar.items.integrations)).toBeInTheDocument();
  });

  it("hides admin-only items from a non-admin user", () => {
    isAdmin = false;
    render(<SettingsSidebar />);

    expect(screen.queryByText(enSettings.shell.sidebar.items.members)).not.toBeInTheDocument();
    expect(screen.queryByText(enSettings.shell.sidebar.items.integrations)).not.toBeInTheDocument();
    expect(screen.getByText(enSettings.shell.sidebar.items.general)).toBeInTheDocument();
  });

  it("marks the active link via its href", () => {
    pathname = "/settings/profile";
    render(<SettingsSidebar />);

    const profileLink = screen.getByText(enSettings.shell.sidebar.items.profile).closest("a");
    expect(profileLink).toHaveAttribute("href", "/settings/profile");
  });

  it("collapses the advanced group when its toggle is pressed", async () => {
    render(<SettingsSidebar />);

    const toggle = screen.getByRole("button", { name: new RegExp(enSettings.shell.sidebar.advanced, "i") });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
