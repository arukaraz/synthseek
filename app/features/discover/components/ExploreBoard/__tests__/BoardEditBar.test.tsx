import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";
import enDiscover from "@modules/i18n/messages/en/discover.json";
import enWidgets from "@modules/i18n/messages/en/widgets.json";

import { BoardEditBar } from "../BoardEditBar";
import type { BoardEditBarProps } from "../types";

function handlers(): BoardEditBarProps {
  return { onAddSpacer: vi.fn(), onWidgets: vi.fn() };
}

describe("BoardEditBar", () => {
  it("says the board is being edited, then offers Add and Appearance in the part that scrolls", () => {
    render(<BoardEditBar {...handlers()} />);
    const add = screen.getByRole("button", { name: "Add" });

    expect(screen.getByRole("toolbar").textContent).toBe(`${enDiscover.board.editBar.title}AddAppearance`);
    expect(add.parentElement?.parentElement).toHaveClass("overflow-x-auto");
    expect(Array.from(add.parentElement?.children ?? [], (button) => button.textContent)).toEqual([
      "Add",
      "Appearance",
    ]);
  });

  it("holds no Done of its own, which lives on the floating button", () => {
    render(<BoardEditBar {...handlers()} />);

    expect(screen.queryByRole("button", { name: "Done" })).not.toBeInTheDocument();
  });

  it("is a sticky toolbar", () => {
    render(<BoardEditBar {...handlers()} />);

    expect(screen.getByRole("toolbar")).toHaveClass("sticky");
  });

  it("takes Appearance to the board tab under Settings, where the arrangement, look and templates live", () => {
    render(<BoardEditBar {...handlers()} />);

    expect(screen.getByRole("link", { name: enWidgets.board.appearance.title })).toHaveAttribute(
      "href",
      "/settings/customization/board"
    );
  });

  it.each([
    ["Widgets", "onWidgets"],
    ["Spacer", "onAddSpacer"],
  ] as const)("runs %s from the Add menu", async (name, handler) => {
    const actions = handlers();
    render(<BoardEditBar {...actions} />);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Add" }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByRole("menuitem", { name }));

    expect(actions[handler]).toHaveBeenCalledTimes(1);
  });

  it("lists Widgets before Spacer in the Add menu", async () => {
    render(<BoardEditBar {...handlers()} />);

    fireEvent.pointerDown(screen.getByRole("button", { name: "Add" }), { button: 0, ctrlKey: false });

    expect((await screen.findAllByRole("menuitem")).map((item) => item.textContent)).toEqual(["Widgets", "Spacer"]);
  });
});
