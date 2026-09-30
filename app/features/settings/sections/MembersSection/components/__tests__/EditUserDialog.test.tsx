import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Role } from "@api/__generated__/types";

import { createMockMutation } from "@test/mocks/trpc.mock";
import { createMockUser } from "@test/mocks/feature-hooks.mock";

import { EditUserDialog } from "../EditUserDialog";

import enSettings from "@modules/i18n/messages/en/settings.json";

const mutation = createMockMutation();

vi.mock("@hooks/api/mutations/users/useUpdateUser", () => ({
  useUpdateUser: () => mutation,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EditUserDialog", () => {
  it("renders nothing when no member is provided", () => {
    const { container } = render(<EditUserDialog member={null} open onOpenChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("prefills the form with the member values", () => {
    const member = createMockUser({ username: "alice", email: "alice@example.com", role: Role.enum.admin });
    render(<EditUserDialog member={member} open onOpenChange={vi.fn()} />);

    expect(screen.getByLabelText(enSettings.members.edit.usernameAriaLabel)).toHaveValue("alice");
    expect(screen.getByLabelText(enSettings.members.edit.emailAriaLabel)).toHaveValue("alice@example.com");
  });

  it("sends only changed fields to the update mutation", async () => {
    const member = createMockUser({ id: "m1", username: "alice", email: "alice@example.com", role: Role.enum.member });
    render(<EditUserDialog member={member} open onOpenChange={vi.fn()} />);

    const usernameInput = screen.getByLabelText(enSettings.members.edit.usernameAriaLabel);
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, "alicia");
    await userEvent.click(screen.getByRole("button", { name: enSettings.members.edit.submit }));

    expect(mutation.mutate).toHaveBeenCalledWith(
      { id: "m1", username: "alicia", email: undefined, role: undefined, password: undefined },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("includes a new password when provided", async () => {
    const member = createMockUser({ id: "m2", username: "bob", email: "bob@example.com", role: Role.enum.member });
    render(<EditUserDialog member={member} open onOpenChange={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(enSettings.members.edit.passwordAriaLabel), "newsecret");
    await userEvent.click(screen.getByRole("button", { name: enSettings.members.edit.submit }));

    expect(mutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "m2", password: "newsecret" }),
      expect.any(Object)
    );
  });

  it("prefills the member's own quotas and leaves an unset one empty", () => {
    const member = createMockUser({ role: Role.enum.member, quotaTracks: 40, quotaStorageGb: null });
    render(<EditUserDialog member={member} open onOpenChange={vi.fn()} />);

    expect(screen.getByLabelText(enSettings.members.edit.quotaTracksAriaLabel)).toHaveValue("40");
    expect(screen.getByLabelText(enSettings.members.edit.quotaStorageAriaLabel)).toHaveValue("");
  });

  it("hides the quota fields once the chosen role is not member", async () => {
    const member = createMockUser({ role: Role.enum.member });
    render(<EditUserDialog member={member} open onOpenChange={vi.fn()} />);

    await userEvent.click(screen.getByRole("radio", { name: enSettings.members.roleOptions.trusted }));

    expect(screen.queryByLabelText(enSettings.members.edit.quotaTracksAriaLabel)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(enSettings.members.edit.quotaStorageAriaLabel)).not.toBeInTheDocument();
  });

  it("sends a changed quota and clears an emptied one back to the global", async () => {
    const member = createMockUser({ id: "m3", role: Role.enum.member, quotaTracks: 40, quotaStorageGb: 2.5 });
    render(<EditUserDialog member={member} open onOpenChange={vi.fn()} />);

    const tracksInput = screen.getByLabelText(enSettings.members.edit.quotaTracksAriaLabel);
    await userEvent.clear(tracksInput);
    await userEvent.type(tracksInput, "60");
    await userEvent.clear(screen.getByLabelText(enSettings.members.edit.quotaStorageAriaLabel));
    await userEvent.click(screen.getByRole("button", { name: enSettings.members.edit.submit }));

    expect(mutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "m3", quotaTracks: 60, quotaStorageGb: null }),
      expect.any(Object)
    );
  });

  it("leaves unchanged quotas out of the update", async () => {
    const member = createMockUser({ id: "m4", role: Role.enum.member, quotaTracks: 40, quotaStorageGb: 2.5 });
    render(<EditUserDialog member={member} open onOpenChange={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(enSettings.members.edit.passwordAriaLabel), "newsecret");
    await userEvent.click(screen.getByRole("button", { name: enSettings.members.edit.submit }));

    expect(mutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "m4", password: "newsecret", quotaTracks: undefined, quotaStorageGb: undefined }),
      expect.any(Object)
    );
  });

  it("blocks saving a new password shorter than the minimum and says what it needs", async () => {
    const member = createMockUser({ role: Role.enum.member });
    render(<EditUserDialog member={member} open onOpenChange={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(enSettings.members.edit.passwordAriaLabel), "short");

    expect(screen.getByRole("button", { name: enSettings.members.edit.submit })).toBeDisabled();
    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
  });

  it("blocks saving while a quota is not a valid amount", async () => {
    const member = createMockUser({ role: Role.enum.member });
    render(<EditUserDialog member={member} open onOpenChange={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(enSettings.members.edit.quotaTracksAriaLabel), "2.5");

    expect(screen.getByRole("button", { name: enSettings.members.edit.submit })).toBeDisabled();
  });

  it("shows the owner role note and disables the role control for owners", () => {
    const member = createMockUser({ id: "owner", username: "owner", isOwner: true, role: Role.enum.admin });
    render(<EditUserDialog member={member} open onOpenChange={vi.fn()} />);

    expect(screen.getByText(enSettings.members.edit.ownerRoleNote)).toBeInTheDocument();
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
  });
});
