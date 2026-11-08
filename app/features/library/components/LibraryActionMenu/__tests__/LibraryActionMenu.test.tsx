import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";
import { Pencil, Trash2 } from "lucide-react";

import { LibraryActionMenu } from "../LibraryActionMenu";

const viewport = vi.hoisted(() => ({ phone: false }));

vi.mock("@hooks/ui/useMediaQuery", () => ({
  useMediaQuery: () => viewport.phone,
}));

function renderMenu(onRename: () => void, onDelete: () => void) {
  return renderWithProviders(
    <LibraryActionMenu
      title="Discovery"
      subtitle="Daft Punk"
      triggerLabel="Actions for Discovery"
      triggerClassName=""
      actions={[
        { key: "rename", icon: Pencil, label: "Rename", onSelect: onRename },
        { key: "delete", icon: Trash2, label: "Delete", onSelect: onDelete, tone: "danger", disabled: true },
      ]}
    />
  );
}

describe("LibraryActionMenu", () => {
  it("opens a bottom sheet titled with the item on a phone, running the action and closing on pick", async () => {
    viewport.phone = true;
    const onRename = vi.fn();
    const { user } = renderMenu(onRename, vi.fn());

    await user.click(screen.getByRole("button", { name: "Actions for Discovery" }));

    const sheet = screen.getByRole("dialog");
    expect(sheet).toHaveTextContent("Discovery");
    expect(sheet).toHaveTextContent("Daft Punk");
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Rename" }));

    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the dropdown menu on a wider screen", async () => {
    viewport.phone = false;
    const onRename = vi.fn();
    const { user } = renderMenu(onRename, vi.fn());

    await user.click(screen.getByRole("button", { name: "Actions for Discovery" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(onRename).toHaveBeenCalledTimes(1);
  });
});
