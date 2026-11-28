import { Music } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { WidgetFrame } from "../WidgetFrame";

const device = vi.hoisted(() => ({ value: "wide" }));

vi.mock("@hooks/ui/board/useBoardDevice", () => ({ useBoardDevice: () => device.value }));

function frame(overrides: { loading?: boolean; note?: string | null; compactOnPhone?: boolean } = {}) {
  return render(
    <WidgetFrame
      icon={Music}
      title="Plays"
      subtitle="Last 7 days"
      info="Plays from every app"
      titleId="plays-heading"
      loading={overrides.loading ?? false}
      note={overrides.note ?? null}
      compactOnPhone={overrides.compactOnPhone}
    >
      <span>body</span>
    </WidgetFrame>
  );
}

describe("WidgetFrame", () => {
  it("names the region by its title and shows the body when ready", () => {
    frame();

    expect(screen.getByRole("region", { name: "Plays" })).toHaveTextContent("body");
  });

  it("lets a keyboard reach a body that scrolls, named by the title of the widget", () => {
    const scrollHeight = vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(300);
    const clientHeight = vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    frame();

    expect(screen.getByRole("group", { name: "Plays" })).toHaveAttribute("tabindex", "0");

    scrollHeight.mockRestore();
    clientHeight.mockRestore();
  });

  it("adds no stop for the keyboard to a body that fits", () => {
    frame();

    expect(screen.queryByRole("group", { name: "Plays" })).not.toBeInTheDocument();
    expect(screen.getByText("body").parentElement).not.toHaveAttribute("tabindex");
  });

  it("shows a skeleton instead of the body while loading", () => {
    frame({ loading: true });

    expect(screen.queryByText("body")).not.toBeInTheDocument();
  });

  it("shows the note instead of the body", () => {
    frame({ note: "Nothing yet." });

    expect(screen.getByText("Nothing yet.")).toBeInTheDocument();
    expect(screen.queryByText("body")).not.toBeInTheDocument();
  });

  it("drops the header icon on a phone only when asked to", () => {
    device.value = "narrow";
    const { container, unmount } = frame({ compactOnPhone: true });
    expect(container.querySelector("svg.lucide-music")).toBeNull();
    unmount();

    expect(frame().container.querySelector("svg.lucide-music")).not.toBeNull();
    device.value = "wide";
  });

  it("keeps the header icon on a wide screen", () => {
    device.value = "wide";

    expect(frame({ compactOnPhone: true }).container.querySelector("svg.lucide-music")).not.toBeNull();
  });
});
