import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Role } from "@api/__generated__/types";

import {
  createMockMutation,
  createMockQuery,
  createLoadingQuery,
  createErrorQuery,
  type MockQueryResult,
} from "@test/mocks/trpc.mock";
import { createMockUser } from "@test/mocks/feature-hooks.mock";
import type { MemberListItem } from "../types";

import enSettings from "@modules/i18n/messages/en/settings.json";

let usersQuery: MockQueryResult<MemberListItem[]> = createMockQuery<MemberListItem[]>([]);
const deleteUser = createMockMutation();
const bulkRole = createMockMutation();
const bulkDelete = createMockMutation();
const confirmMock = vi.fn();
let isAdmin = true;

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin, currentUser: createMockUser({ id: "current" }), isLoading: false }),
}));

vi.mock("@utils/confirm", () => ({
  confirm: (...args: unknown[]) => confirmMock(...args),
}));

vi.mock("@hooks/api/queries/useUsers", () => ({
  useUsers: () => usersQuery,
}));

vi.mock("@hooks/api/mutations/users/useDeleteUser", () => ({ useDeleteUser: () => deleteUser }));
vi.mock("@hooks/api/mutations/users/useBulkUpdateRole", () => ({ useBulkUpdateRole: () => bulkRole }));
vi.mock("@hooks/api/mutations/users/useBulkDeleteUsers", () => ({ useBulkDeleteUsers: () => bulkDelete }));

vi.mock("../components/CreateLocalUserDialog", () => ({
  CreateLocalUserDialog: ({ open }: { open: boolean }) => (open ? <div data-testid="create-dialog" /> : null),
}));
vi.mock("../components/ImportPlexUsersDialog", () => ({
  ImportPlexUsersDialog: ({ open }: { open: boolean }) => (open ? <div data-testid="import-dialog" /> : null),
}));
vi.mock("../components/EditUserDialog", () => ({
  EditUserDialog: ({ open }: { open: boolean }) => (open ? <div data-testid="edit-dialog" /> : null),
}));

import { MembersSection } from "../MembersSection";

beforeEach(() => {
  isAdmin = true;
  usersQuery = createMockQuery<MemberListItem[]>([]);
  confirmMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MembersSection", () => {
  it("renders the admin-only notice when the user is not an admin", () => {
    isAdmin = false;
    render(<MembersSection />);
    expect(screen.getByText(enSettings.members.adminOnly)).toBeInTheDocument();
  });

  it("renders the loading state", () => {
    usersQuery = createLoadingQuery<MemberListItem[]>();
    render(<MembersSection />);
    expect(screen.getByText(enSettings.members.loading)).toBeInTheDocument();
  });

  it("renders the error state", () => {
    usersQuery = createErrorQuery<MemberListItem[]>(new Error("boom"));
    render(<MembersSection />);
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it("renders the empty state when there are no members", () => {
    usersQuery = createMockQuery<MemberListItem[]>([]);
    render(<MembersSection />);
    expect(screen.getByText(enSettings.members.empty)).toBeInTheDocument();
  });

  it("renders the member rows in the table", () => {
    usersQuery = createMockQuery<MemberListItem[]>([createMockUser({ id: "m1", username: "alice" })]);
    render(<MembersSection />);
    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  it("opens the create and import dialogs from the toolbar", async () => {
    usersQuery = createMockQuery<MemberListItem[]>([createMockUser({ id: "m1", username: "alice" })]);
    render(<MembersSection />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.members.toolbar.createLocal }));
    expect(screen.getByTestId("create-dialog")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.members.toolbar.importPlex }));
    expect(screen.getByTestId("import-dialog")).toBeInTheDocument();
  });

  it("shows the bulk bar and performs a bulk role change when rows are selected", async () => {
    usersQuery = createMockQuery<MemberListItem[]>([
      createMockUser({ id: "m1", username: "alice" }),
      createMockUser({ id: "m2", username: "bob" }),
    ]);
    render(<MembersSection />);

    await userEvent.click(screen.getByLabelText(enSettings.members.columns.selectAll));
    await userEvent.click(screen.getByRole("button", { name: enSettings.members.bulk.makeAdmin }));

    expect(bulkRole.mutate).toHaveBeenCalledWith(
      { ids: ["m1", "m2"], role: Role.enum.admin },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("confirms before bulk deleting selected rows", async () => {
    confirmMock.mockResolvedValue(true);
    usersQuery = createMockQuery<MemberListItem[]>([createMockUser({ id: "m1", username: "alice" })]);
    render(<MembersSection />);

    await userEvent.click(screen.getByLabelText(enSettings.members.columns.selectAll));
    await userEvent.click(screen.getByRole("button", { name: enSettings.members.bulk.delete }));

    await waitFor(() => {
      expect(bulkDelete.mutate).toHaveBeenCalledWith(
        { ids: ["m1"] },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      );
    });
  });

  it("does not bulk delete when the confirmation is declined", async () => {
    confirmMock.mockResolvedValue(false);
    usersQuery = createMockQuery<MemberListItem[]>([createMockUser({ id: "m1", username: "alice" })]);
    render(<MembersSection />);

    await userEvent.click(screen.getByLabelText(enSettings.members.columns.selectAll));
    await userEvent.click(screen.getByRole("button", { name: enSettings.members.bulk.delete }));

    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(bulkDelete.mutate).not.toHaveBeenCalled();
  });

  it("clears the selection from the bulk bar", async () => {
    usersQuery = createMockQuery<MemberListItem[]>([createMockUser({ id: "m1", username: "alice" })]);
    render(<MembersSection />);

    await userEvent.click(screen.getByLabelText(enSettings.members.columns.selectAll));
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.members.bulk.clear }));
    expect(screen.queryByText("1 selected")).not.toBeInTheDocument();
  });

  it("confirms before deleting a single member via the row action", async () => {
    confirmMock.mockResolvedValue(true);
    usersQuery = createMockQuery<MemberListItem[]>([createMockUser({ id: "m1", username: "alice" })]);
    render(<MembersSection />);

    await userEvent.click(screen.getByLabelText("Delete alice"));

    await waitFor(() => {
      expect(deleteUser.mutate).toHaveBeenCalledWith({ id: "m1" });
    });
  });

  it("opens the edit dialog from the row action", async () => {
    usersQuery = createMockQuery<MemberListItem[]>([createMockUser({ id: "m1", username: "alice" })]);
    render(<MembersSection />);

    await userEvent.click(screen.getByLabelText("Edit alice"));
    expect(screen.getByTestId("edit-dialog")).toBeInTheDocument();
  });
});
