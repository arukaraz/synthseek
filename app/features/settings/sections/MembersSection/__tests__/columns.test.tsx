import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { createMockUser } from "@test/mocks/feature-hooks.mock";

import { buildMemberColumns } from "../columns";
import type { BuildMemberColumnsArgs } from "../types";

const t = ((key: string, params?: Record<string, unknown>) => {
  if (key === "members.columns.selectAll") return "select all";
  if (key === "members.columns.selectMember" && params) return `select ${params.username}`;
  if (key === "members.actions.edit" && params) return `edit ${params.username}`;
  if (key === "members.actions.delete" && params) return `delete ${params.username}`;
  return key;
}) as unknown as BuildMemberColumnsArgs["t"];

function buildArgs(overrides: Partial<BuildMemberColumnsArgs> = {}): BuildMemberColumnsArgs {
  return {
    t,
    currentUserId: "current",
    selectedIds: new Set<string>(),
    allSelected: false,
    someSelected: false,
    onToggle: vi.fn(),
    onToggleAll: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
}

function renderNode(node: ReactNode) {
  return render(<>{node}</>);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("buildMemberColumns", () => {
  it("builds the expected column keys", () => {
    const columns = buildMemberColumns(buildArgs());
    expect(columns.map((column) => column.key)).toEqual([
      "select",
      "user",
      "requests",
      "type",
      "role",
      "joined",
      "actions",
    ]);
  });

  it("renders the header select-all checkbox and invokes onToggleAll", async () => {
    const onToggleAll = vi.fn();
    const columns = buildMemberColumns(buildArgs({ onToggleAll, allSelected: true }));
    const header = columns[0]?.header;
    const headerNode = typeof header === "function" ? header() : header;
    renderNode(headerNode);

    const checkbox = screen.getByLabelText("select all");
    await userEvent.click(checkbox);
    expect(onToggleAll).toHaveBeenCalledOnce();
  });

  it("renders a row select checkbox and invokes onToggle with the member id", async () => {
    const onToggle = vi.fn();
    const member = createMockUser({ id: "m1", username: "alice" });
    const columns = buildMemberColumns(buildArgs({ onToggle, selectedIds: new Set(["m1"]) }));
    renderNode(columns[0]?.cell(member));

    const checkbox = screen.getByLabelText("select alice");
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith("m1");
  });

  it("renders the request count cell", () => {
    const columns = buildMemberColumns(buildArgs());
    renderNode(columns[2]?.cell(createMockUser({ requestCount: 7 })));
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders the joined date cell", () => {
    const columns = buildMemberColumns(buildArgs());
    renderNode(columns[5]?.cell(createMockUser({ created_at: new Date("2024-03-15T00:00:00Z") })));
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("wires the actions cell edit and delete handlers", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const member = createMockUser({ id: "m2", username: "bob" });
    const columns = buildMemberColumns(buildArgs({ onEdit, onDelete }));
    renderNode(columns[6]?.cell(member));

    await userEvent.click(screen.getByLabelText("Edit bob"));
    expect(onEdit).toHaveBeenCalledWith(member);

    await userEvent.click(screen.getByLabelText("Delete bob"));
    expect(onDelete).toHaveBeenCalledWith(member);
  });
});
