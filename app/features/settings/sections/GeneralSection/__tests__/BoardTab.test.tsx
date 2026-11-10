import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

vi.mock("@features/discover/components/BoardSettings/BoardSettingsEditor", () => ({
  BoardSettingsEditor: () => <div data-testid="board-editor" />,
}));

import { BoardTab } from "../BoardTab";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

describe("BoardTab", () => {
  it("wraps the board editor in the Board card the settings search points at", () => {
    render(<BoardTab />);

    const card = screen.getByRole("heading", { level: 2, name: /^Board/ }).closest("section");
    expect(card).toHaveAttribute("data-anchor-target", "board");
    expect(card).toContainElement(screen.getByTestId("board-editor"));
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });
});
