import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Role } from "@api/__generated__/types";

import { createMockMutation } from "@test/mocks/trpc.mock";

import { CreateLocalUserDialog } from "../CreateLocalUserDialog";

import enSettings from "@modules/i18n/messages/en/settings.json";

const mutation = createMockMutation();

vi.mock("@hooks/api/mutations/users/useCreateLocalUser", () => ({
  useCreateLocalUser: () => mutation,
}));

beforeEach(() => {
  mutation.mutate.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CreateLocalUserDialog", () => {
  it("renders the title and description when open", () => {
    render(<CreateLocalUserDialog open onOpenChange={vi.fn()} />);
    expect(screen.getByText(enSettings.members.create.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.members.create.description)).toBeInTheDocument();
  });

  it("disables submit until all fields are valid", async () => {
    render(<CreateLocalUserDialog open onOpenChange={vi.fn()} />);
    const submit = screen.getByRole("button", { name: enSettings.members.create.submit });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(enSettings.members.create.emailAriaLabel), "user@example.com");
    await userEvent.type(screen.getByLabelText(enSettings.members.create.usernameAriaLabel), "newuser");
    await userEvent.type(screen.getByLabelText(enSettings.members.create.passwordAriaLabel), "password1");

    expect(submit).not.toBeDisabled();
  });

  it("submits the trimmed values with the selected role", async () => {
    render(<CreateLocalUserDialog open onOpenChange={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(enSettings.members.create.emailAriaLabel), "  user@example.com  ");
    await userEvent.type(screen.getByLabelText(enSettings.members.create.usernameAriaLabel), "  newuser  ");
    await userEvent.type(screen.getByLabelText(enSettings.members.create.passwordAriaLabel), "password1");
    await userEvent.click(screen.getByRole("button", { name: enSettings.members.create.submit }));

    expect(mutation.mutate).toHaveBeenCalledWith(
      { email: "user@example.com", username: "newuser", password: "password1", role: Role.enum.member },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("resets the form and closes after a successful submit", async () => {
    const onOpenChange = vi.fn();
    mutation.mutate.mockImplementation((_vars: unknown, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.());
    render(<CreateLocalUserDialog open onOpenChange={onOpenChange} />);

    await userEvent.type(screen.getByLabelText(enSettings.members.create.emailAriaLabel), "user@example.com");
    await userEvent.type(screen.getByLabelText(enSettings.members.create.usernameAriaLabel), "newuser");
    await userEvent.type(screen.getByLabelText(enSettings.members.create.passwordAriaLabel), "password1");
    await userEvent.click(screen.getByRole("button", { name: enSettings.members.create.submit }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ignores a form submission while the inputs are invalid", async () => {
    render(<CreateLocalUserDialog open onOpenChange={vi.fn()} />);

    const emailInput = screen.getByLabelText(enSettings.members.create.emailAriaLabel);
    await userEvent.type(emailInput, "user@example.com{Enter}");

    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("closes via the dialog dismissal", async () => {
    const onOpenChange = vi.fn();
    render(<CreateLocalUserDialog open onOpenChange={onOpenChange} />);

    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
