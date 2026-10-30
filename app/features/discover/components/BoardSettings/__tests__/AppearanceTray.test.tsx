import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BoardAppearance } from "@hooks/api/queries/board/types";
import { fireEvent, render, screen } from "@test/test-utils";

const mocks = vi.hoisted(() => ({
  appearance: vi.fn<() => BoardAppearance | undefined>(),
  setAppearance: vi.fn<(appearance: BoardAppearance) => void>(),
}));

vi.mock("@hooks/api/queries/board/useBoardAppearance", () => ({
  useBoardAppearance: () => ({ data: mocks.appearance() }),
}));
vi.mock("@hooks/api/mutations/board/useSetBoardAppearance", () => ({
  useSetBoardAppearance: () => mocks.setAppearance,
}));

import type { BoardBackground } from "../../ExploreBoard/types";
import { AppearanceTray } from "../AppearanceTray";

function renderTray(background: BoardBackground = "on") {
  const onBackground = vi.fn<(shown: boolean) => void>();
  render(<AppearanceTray background={background} onBackground={onBackground} />);
  return onBackground;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.appearance.mockReturnValue({ density: "comfortable", text: "default" });
});

describe("AppearanceTray", () => {
  it("saves the density and the text size the member picks, keeping the other axis", () => {
    renderTray();

    fireEvent.click(screen.getByRole("radio", { name: "Compact" }));
    fireEvent.click(screen.getByRole("radio", { name: "Large" }));

    expect(mocks.setAppearance.mock.calls).toEqual([
      [{ density: "compact", text: "default" }],
      [{ density: "comfortable", text: "large" }],
    ]);
  });

  it("offers no density or text choice until the member's own look has loaded", () => {
    mocks.appearance.mockReturnValue(undefined);
    renderTray();

    expect(screen.queryByRole("radio", { name: "Comfortable" })).toBeNull();
    expect(screen.queryByRole("radio", { name: "Default" })).toBeNull();
  });

  it("sets the background of the whole board and leaves the saved look alone", () => {
    const onBackground = renderTray("on");

    fireEvent.click(screen.getByRole("radio", { name: "Off" }));

    expect(onBackground).toHaveBeenCalledWith(false);
    expect(mocks.setAppearance).not.toHaveBeenCalled();
  });

  it.each([
    ["on", "true", "false"],
    ["off", "false", "true"],
    ["mixed", "false", "false"],
  ] as const)("shows a %s board as it is, marking neither choice when the tiles differ", (background, on, off) => {
    renderTray(background);

    expect(screen.getByRole("radio", { name: "On" })).toHaveAttribute("aria-checked", on);
    expect(screen.getByRole("radio", { name: "Off" })).toHaveAttribute("aria-checked", off);
  });

  it("stays out of the way of the board: it is no dialog, so nothing traps focus or dims the page", () => {
    renderTray();

    expect(screen.getByRole("group", { name: "Appearance" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
