import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import { createMockUser } from "@test/mocks/feature-hooks.mock";

import { EditProfileCard } from "../EditProfileCard";

const update = createMockMutation();

vi.mock("@hooks/api/mutations/auth/useUpdateProfile", () => ({
  useUpdateProfile: () => update,
}));

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditProfileCard", () => {
  it("renders the current profile values", () => {
    render(
      <EditProfileCard
        user={createMockUser({ username: "alice", email: "alice@example.com", avatar_url: "https://img/a.png" })}
      />
    );
    expect(screen.getByLabelText(enSettings.profile.edit.usernameAriaLabel)).toHaveValue("alice");
    expect(screen.getByLabelText(enSettings.profile.edit.emailAriaLabel)).toHaveValue("alice@example.com");
    expect(screen.getByLabelText(enSettings.profile.edit.avatarAriaLabel)).toHaveValue("https://img/a.png");
  });

  it("sends only the changed username and leaves untouched fields undefined", async () => {
    render(<EditProfileCard user={createMockUser({ username: "alice", email: "alice@example.com" })} />);

    const username = screen.getByLabelText(enSettings.profile.edit.usernameAriaLabel);
    await userEvent.clear(username);
    await userEvent.type(username, "alice2");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        username: "alice2",
        email: undefined,
        avatar_url: undefined,
      });
    });
  });

  it("disables the email field and shows the plex hint for a plex user", () => {
    render(<EditProfileCard user={createMockUser({ plex_username: "plexuser" })} />);
    expect(screen.getByLabelText(enSettings.profile.edit.emailAriaLabel)).toBeDisabled();
    expect(screen.getByText(enSettings.profile.edit.emailManagedByPlex)).toBeInTheDocument();
  });

  it("sends the edited email for a local user", async () => {
    render(<EditProfileCard user={createMockUser({ plex_username: null, email: "alice@example.com" })} />);

    const email = screen.getByLabelText(enSettings.profile.edit.emailAriaLabel);
    await userEvent.clear(email);
    await userEvent.type(email, "new@example.com");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        username: undefined,
        email: "new@example.com",
        avatar_url: undefined,
      });
    });
  });

  it("normalizes a cleared avatar to null", async () => {
    render(<EditProfileCard user={createMockUser({ avatar_url: "https://img/a.png" })} />);

    fireEvent.change(screen.getByLabelText(enSettings.profile.edit.avatarAriaLabel), { target: { value: "" } });
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(update.mutateAsync).toHaveBeenCalledWith({
        username: undefined,
        email: undefined,
        avatar_url: null,
      });
    });
  });
});
