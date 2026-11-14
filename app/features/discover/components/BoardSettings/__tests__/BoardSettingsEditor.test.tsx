import { describe, expect, it, vi } from "vitest";

import type { BoardLayout } from "@hooks/api/queries/board/types";
import { render, screen } from "@test/test-utils";

import type { BoardSettingsFormProps } from "../types";
import { BoardSettingsEditor } from "../BoardSettingsEditor";

const { layout, formProps } = vi.hoisted(() => ({
  layout: { data: undefined as BoardLayout | undefined, isLoading: true },
  formProps: vi.fn<(props: BoardSettingsFormProps) => void>(),
}));

vi.mock("@hooks/api/queries/board/useBoardLayout", () => ({ useBoardLayout: () => layout }));
vi.mock("@hooks/api/queries/board/useBoardAppearance", () => ({
  useBoardAppearance: () => ({ data: { density: "compact", text: "large" } }),
}));
vi.mock("@hooks/api/queries/widgets/useMyWidgets", () => ({
  useMyWidgets: () => ({ data: [], isLoading: false, isError: false }),
}));
vi.mock("@hooks/ui/board/useBoardDevice", () => ({ useBoardDevice: () => "narrow" }));
vi.mock("../BoardSettingsForm", () => ({
  BoardSettingsForm: (props: BoardSettingsFormProps) => {
    formProps(props);
    return <div data-testid="board-settings-form" />;
  },
}));

describe("BoardSettingsEditor", () => {
  it("shows the section loader while the saved board loads", () => {
    layout.isLoading = true;
    layout.data = undefined;

    const { container } = render(<BoardSettingsEditor />);

    expect(container.querySelector(".animate-spin")).not.toBeNull();
    expect(screen.queryByTestId("board-settings-form")).toBeNull();
  });

  it("hands the saved board, the member's look and the device to the form", () => {
    layout.isLoading = false;
    layout.data = {
      schemaVersion: 5,
      items: [{ kind: "builtin", id: "a", widget: "scrobbles", size: "M" }],
      mobile: [{ kind: "builtin", id: "m", widget: "requests", size: "S" }],
    };

    render(<BoardSettingsEditor />);

    expect(screen.getByTestId("board-settings-form")).toBeInTheDocument();
    expect(formProps).toHaveBeenCalledWith(
      expect.objectContaining({
        device: "narrow",
        appearance: { density: "compact", text: "large" },
        customStatus: "ready",
        lists: { items: layout.data.items, mobile: layout.data.mobile },
      })
    );
  });
});
