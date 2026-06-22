import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import { createMockUser } from "@test/mocks/feature-hooks.mock";

import { ChangePasswordCard } from "../ChangePasswordCard";

const change = createMockMutation();

vi.mock("@hooks/api/mutations/auth/useChangePassword", () => ({
  useChangePassword: () => change,
}));

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ChangePasswordCard", () => {
  it("renders the form for a local user", () => {
    render(<ChangePasswordCard user={createMockUser({ plex_username: null })} />);
    expect(screen.getByLabelText(enSettings.profile.password.currentAriaLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(enSettings.profile.password.newAriaLabel)).toBeInTheDocument();
  });

  it("renders the managed-by-plex notice for a plex user", () => {
    render(<ChangePasswordCard user={createMockUser({ plex_username: "plexuser" })} />);
    expect(screen.getByText(enSettings.profile.password.managedByPlex)).toBeInTheDocument();
    expect(screen.queryByLabelText(enSettings.profile.password.currentAriaLabel)).not.toBeInTheDocument();
  });

  it("keeps the submit button disabled until both fields are valid", async () => {
    render(<ChangePasswordCard user={createMockUser({ plex_username: null })} />);
    const submit = screen.getByRole("button", { name: enSettings.profile.password.submit });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(enSettings.profile.password.currentAriaLabel), "oldpass");
    await userEvent.type(screen.getByLabelText(enSettings.profile.password.newAriaLabel), "short");
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(enSettings.profile.password.newAriaLabel), "longenough");
    expect(submit).toBeEnabled();
  });

  it("submits the password change and clears the inputs on success", async () => {
    change.mutate.mockImplementation((_payload, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.());
    render(<ChangePasswordCard user={createMockUser({ plex_username: null })} />);

    const current = screen.getByLabelText(enSettings.profile.password.currentAriaLabel);
    const next = screen.getByLabelText(enSettings.profile.password.newAriaLabel);
    await userEvent.type(current, "oldpass1");
    await userEvent.type(next, "newpassword");
    await userEvent.click(screen.getByRole("button", { name: enSettings.profile.password.submit }));

    await waitFor(() => {
      expect(change.mutate).toHaveBeenCalledWith(
        { currentPassword: "oldpass1", newPassword: "newpassword" },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      );
    });
    expect(current).toHaveValue("");
    expect(next).toHaveValue("");
  });
});
