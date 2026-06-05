import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Role } from "@api/__generated__/types";

import {
  createMockMutation,
  createMockQuery,
  createLoadingQuery,
  createErrorQuery,
  type MockQueryResult,
} from "@test/mocks/trpc.mock";

import { ImportPlexUsersDialog } from "../ImportPlexUsersDialog";
import type { PlexImportableUser } from "../../types";

import enSettings from "@modules/i18n/messages/en/settings.json";

let importableQuery: MockQueryResult<PlexImportableUser[]> = createMockQuery<PlexImportableUser[]>([]);
const importMutation = createMockMutation();

vi.mock("@hooks/api/queries/usePlexImportableUsers", () => ({
  usePlexImportableUsers: () => importableQuery,
}));

vi.mock("@hooks/api/mutations/users/useImportPlexUsers", () => ({
  useImportPlexUsers: () => importMutation,
}));

function plexUser(overrides: Partial<PlexImportableUser> = {}): PlexImportableUser {
  return {
    plexId: "p1",
    username: "plexuser",
    title: "Plex User",
    email: "plex@example.com",
    thumb: null,
    alreadyImported: false,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  importableQuery = createMockQuery<PlexImportableUser[]>([]);
});

describe("ImportPlexUsersDialog", () => {
  it("shows the loading state", () => {
    importableQuery = createLoadingQuery<PlexImportableUser[]>();
    render(<ImportPlexUsersDialog open onOpenChange={vi.fn()} />);
    expect(screen.getByText(enSettings.members.import.loading)).toBeInTheDocument();
  });

  it("shows the error notice", () => {
    importableQuery = createErrorQuery<PlexImportableUser[]>(new Error("plex down"));
    render(<ImportPlexUsersDialog open onOpenChange={vi.fn()} />);
    expect(screen.getByText("plex down")).toBeInTheDocument();
  });

  it("shows the empty state when no users are available", () => {
    importableQuery = createMockQuery<PlexImportableUser[]>([]);
    render(<ImportPlexUsersDialog open onOpenChange={vi.fn()} />);
    expect(screen.getByText(enSettings.members.import.empty)).toBeInTheDocument();
  });

  it("marks already imported users and disables their checkbox", () => {
    importableQuery = createMockQuery<PlexImportableUser[]>([
      plexUser({ plexId: "imported", username: "done", alreadyImported: true }),
    ]);
    render(<ImportPlexUsersDialog open onOpenChange={vi.fn()} />);

    expect(screen.getByText(enSettings.members.import.imported)).toBeInTheDocument();
    expect(screen.getByLabelText("Select done")).toBeDisabled();
  });

  it("selects a user and imports with the chosen role", async () => {
    importableQuery = createMockQuery<PlexImportableUser[]>([plexUser({ plexId: "p1", username: "alice" })]);
    render(<ImportPlexUsersDialog open onOpenChange={vi.fn()} />);

    const submit = screen.getByRole("button", { name: new RegExp(enSettings.members.import.submit) });
    expect(submit).toBeDisabled();

    await userEvent.click(screen.getByText("Plex User"));
    expect(screen.getByRole("button", { name: /\(1\)/ })).not.toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /\(1\)/ }));
    expect(importMutation.mutate).toHaveBeenCalledWith(
      { plexUserIds: ["p1"], role: Role.enum.member },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("toggles all selectable users via the select-all checkbox", async () => {
    importableQuery = createMockQuery<PlexImportableUser[]>([
      plexUser({ plexId: "p1", username: "alice", title: "Alice" }),
      plexUser({ plexId: "p2", username: "bob", title: "Bob" }),
    ]);
    render(<ImportPlexUsersDialog open onOpenChange={vi.fn()} />);

    const selectAll = screen.getByLabelText(enSettings.members.import.selectAll);
    await userEvent.click(selectAll);
    expect(screen.getByRole("button", { name: /\(2\)/ })).toBeInTheDocument();

    await userEvent.click(selectAll);
    expect(screen.queryByRole("button", { name: /\(2\)/ })).not.toBeInTheDocument();
  });

  it("deselects a previously selected user", async () => {
    importableQuery = createMockQuery<PlexImportableUser[]>([plexUser({ plexId: "p1", title: "Alice" })]);
    render(<ImportPlexUsersDialog open onOpenChange={vi.fn()} />);

    await userEvent.click(screen.getByText("Alice"));
    expect(screen.getByRole("button", { name: /\(1\)/ })).toBeInTheDocument();

    await userEvent.click(screen.getByText("Alice"));
    expect(screen.queryByRole("button", { name: /\(1\)/ })).not.toBeInTheDocument();
  });

  it("does not toggle when clicking an already imported row", async () => {
    importableQuery = createMockQuery<PlexImportableUser[]>([
      plexUser({ plexId: "p1", title: "Done", alreadyImported: true }),
    ]);
    render(<ImportPlexUsersDialog open onOpenChange={vi.fn()} />);

    await userEvent.click(screen.getByText("Done"));
    expect(screen.queryByRole("button", { name: /\(\d\)/ })).not.toBeInTheDocument();
  });

  it("closes the dialog via dismissal", async () => {
    const onOpenChange = vi.fn();
    importableQuery = createMockQuery<PlexImportableUser[]>([plexUser({ plexId: "p1", title: "Alice" })]);
    render(<ImportPlexUsersDialog open onOpenChange={onOpenChange} />);

    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
