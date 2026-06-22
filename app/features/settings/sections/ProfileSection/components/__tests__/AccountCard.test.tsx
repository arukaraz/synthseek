import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockUser } from "@test/mocks/feature-hooks.mock";

import { AccountCard } from "../AccountCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
});

describe("AccountCard", () => {
  it("renders the username, email, and member-since label", () => {
    render(<AccountCard user={createMockUser({ username: "alice", email: "alice@example.com" })} />);
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText(enSettings.profile.account.memberSince, { exact: false })).toBeInTheDocument();
  });

  it("labels a local account", () => {
    render(<AccountCard user={createMockUser({ plex_username: null })} />);
    expect(screen.getByText(enSettings.profile.account.localAccount)).toBeInTheDocument();
    expect(screen.queryByText(enSettings.profile.account.plexAccount)).not.toBeInTheDocument();
  });

  it("labels a plex account", () => {
    render(<AccountCard user={createMockUser({ plex_username: "plexuser" })} />);
    expect(screen.getByText(enSettings.profile.account.plexAccount)).toBeInTheDocument();
  });

  it("renders the user avatar when an avatar url is present", () => {
    render(<AccountCard user={createMockUser({ username: "bob", avatar_url: "https://img/avatar.png" })} />);
    const avatar = screen.getByRole("img", { name: "bob" });
    expect(avatar).toHaveAttribute("src", "https://img/avatar.png");
  });

  it("renders a fallback icon when there is no avatar url", () => {
    render(<AccountCard user={createMockUser({ avatar_url: null })} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the role for a member and an admin", () => {
    const { rerender } = render(
      <AccountCard user={createMockUser({ role: "member", username: "alice", email: "alice@example.com" })} />
    );
    expect(screen.getByText("member")).toBeInTheDocument();

    rerender(<AccountCard user={createMockUser({ role: "admin", username: "alice", email: "alice@example.com" })} />);
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  it("renders the card title", () => {
    const { container } = render(<AccountCard user={createMockUser()} />);
    expect(within(container).getByText(enSettings.profile.account.title)).toBeInTheDocument();
  });
});
