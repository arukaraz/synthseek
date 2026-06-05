import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Role } from "@api/__generated__/types";

import { createMockUser } from "@test/mocks/feature-hooks.mock";

import { BulkEditBar } from "../components/BulkEditBar";
import { MemberActionsCell } from "../components/MemberActionsCell";
import { MemberRoleBadge } from "../components/MemberRoleBadge";
import { MemberTypeBadge } from "../components/MemberTypeBadge";
import { MemberUserCell } from "../components/MemberUserCell";
import { MembersToolbar } from "../components/MembersToolbar";

import enSettings from "@modules/i18n/messages/en/settings.json";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MemberTypeBadge", () => {
  it("renders the plex label for plex users", () => {
    render(<MemberTypeBadge isPlexUser />);
    expect(screen.getByText(enSettings.members.type.plex)).toBeInTheDocument();
  });

  it("renders the local label for local users", () => {
    render(<MemberTypeBadge isPlexUser={false} />);
    expect(screen.getByText(enSettings.members.type.local)).toBeInTheDocument();
  });
});

describe("MemberRoleBadge", () => {
  it("renders the owner label", () => {
    render(<MemberRoleBadge member={createMockUser({ isOwner: true })} />);
    expect(screen.getByText(enSettings.members.role.owner)).toBeInTheDocument();
  });

  it("renders the admin label", () => {
    render(<MemberRoleBadge member={createMockUser({ role: Role.enum.admin })} />);
    expect(screen.getByText(enSettings.members.role.admin)).toBeInTheDocument();
  });
});

describe("MemberUserCell", () => {
  it("renders the username, email, and avatar image when present", () => {
    render(<MemberUserCell member={createMockUser({ username: "alice", email: "a@e.com", avatar_url: "/a.png" })} />);
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("a@e.com")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "alice" })).toHaveAttribute("src", "/a.png");
  });

  it("renders the fallback icon when no avatar is present", () => {
    render(<MemberUserCell member={createMockUser({ username: "bob", avatar_url: null })} />);
    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("MembersToolbar", () => {
  it("invokes the create and import handlers", async () => {
    const onCreate = vi.fn();
    const onImport = vi.fn();
    render(<MembersToolbar onCreate={onCreate} onImport={onImport} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.members.toolbar.createLocal }));
    expect(onCreate).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole("button", { name: enSettings.members.toolbar.importPlex }));
    expect(onImport).toHaveBeenCalledOnce();
  });
});

describe("BulkEditBar", () => {
  it("renders the selected count and triggers role and bulk handlers", async () => {
    const onSetRole = vi.fn();
    const onDelete = vi.fn();
    const onClear = vi.fn();
    render(<BulkEditBar count={3} isPending={false} onSetRole={onSetRole} onDelete={onDelete} onClear={onClear} />);

    expect(screen.getByText("3 selected")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.members.bulk.makeUser }));
    expect(onSetRole).toHaveBeenCalledWith(Role.enum.member);

    await userEvent.click(screen.getByRole("button", { name: enSettings.members.bulk.makeAdmin }));
    expect(onSetRole).toHaveBeenCalledWith(Role.enum.admin);

    await userEvent.click(screen.getByRole("button", { name: enSettings.members.bulk.delete }));
    expect(onDelete).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole("button", { name: enSettings.members.bulk.clear }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("disables all actions while pending", () => {
    render(<BulkEditBar count={2} isPending onSetRole={vi.fn()} onDelete={vi.fn()} onClear={vi.fn()} />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });
});

describe("MemberActionsCell", () => {
  it("enables the delete button for a deletable member", () => {
    render(
      <MemberActionsCell
        member={createMockUser({ id: "m1", username: "alice" })}
        currentUserId="current"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Delete alice")).not.toBeDisabled();
  });

  it("disables the delete button for the current user", () => {
    render(
      <MemberActionsCell
        member={createMockUser({ id: "self", username: "self" })}
        currentUserId="self"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Delete self")).toBeDisabled();
  });

  it("disables the delete button for the owner", () => {
    render(
      <MemberActionsCell
        member={createMockUser({ id: "owner", username: "owner", isOwner: true })}
        currentUserId="current"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Delete owner")).toBeDisabled();
  });
});
