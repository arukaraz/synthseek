import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";

const drag = vi.hoisted(() => ({ start: vi.fn() }));

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useDragControls: () => {
      const controls = actual.useDragControls();
      const start = controls.start.bind(controls);
      controls.start = (...args: Parameters<typeof start>) => {
        drag.start(args[0].type);
        return start(...args);
      };
      return controls;
    },
  };
});

import { OrderedChain } from "../OrderedChain";

const t = i18n.getFixedT("en", "settings");

describe("ChainItem drag handle", () => {
  it("starts dragging its own entry when pressed", () => {
    const onSelect = vi.fn();
    render(
      <OrderedChain<"plex" | "jellyfin">
        label="Order"
        entries={[
          { key: "plex", title: "Plex", status: null },
          { key: "jellyfin", title: "Jellyfin", status: null },
        ]}
        selected="plex"
        onSelect={onSelect}
        onReorder={vi.fn()}
        hint="hint"
      />
    );
    fireEvent.pointerDown(screen.getByRole("img", { name: t("shell.chain.drag", { name: "Jellyfin" }) }));
    expect(drag.start).toHaveBeenCalledOnce();
    expect(drag.start).toHaveBeenCalledWith("pointerdown");
    expect(onSelect).not.toHaveBeenCalled();
  });
});
