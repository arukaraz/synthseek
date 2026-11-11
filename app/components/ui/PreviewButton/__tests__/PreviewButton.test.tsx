import { renderWithProviders, screen } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { PreviewButton } from "../PreviewButton";
import { PreviewTime } from "../PreviewTime";

function renderButton(props: Partial<Parameters<typeof PreviewButton>[0]> = {}) {
  const onToggle = vi.fn();
  const onRowClick = vi.fn();
  const rendered = renderWithProviders(
    <div onClick={onRowClick}>
      <PreviewButton title="Aerodynamic" status="idle" clock={null} available onToggle={onToggle} {...props} />
    </div>
  );
  return { ...rendered, onToggle, onRowClick };
}

describe("PreviewButton", () => {
  it("offers the preview by name and length, and keeps the press from reaching what is behind it", async () => {
    const { user, onToggle, onRowClick } = renderButton();

    await user.click(screen.getByRole("button", { name: "Play the 30 second preview of Aerodynamic" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("renames itself to stopping while the preview loads or sounds, without a pressed state", () => {
    renderButton({ status: "playing", clock: { elapsedSeconds: 15, totalSeconds: 30 } });

    const button = screen.getByRole("button", { name: "Stop the preview of Aerodynamic" });
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(screen.queryByRole("button", { name: /Play the/ })).not.toBeInTheDocument();
  });

  it("draws half the ring at half the clip", () => {
    const { container } = renderButton({ status: "playing", clock: { elapsedSeconds: 15, totalSeconds: 30 } });

    const bar = container.querySelectorAll("circle")[1];
    const full = Number(bar.getAttribute("stroke-dasharray"));
    expect(Number(bar.getAttribute("stroke-dashoffset"))).toBeCloseTo(full / 2, 3);
  });

  it("stays in place but cannot be pressed for a track without a preview, and says why", async () => {
    const { user, onToggle, onRowClick } = renderButton({ available: false });

    const locked = screen.getByRole("button", { name: "No preview available for Aerodynamic" });
    expect(locked).toHaveAttribute("aria-disabled", "true");
    await user.hover(locked);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("This track has no preview");

    await user.click(locked);
    expect(onToggle).not.toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("warns instead of offering another try once the preview failed to load", async () => {
    const { user, onToggle } = renderButton({ status: "error" });

    const failed = screen.getByRole("button", { name: "Preview unavailable: Aerodynamic" });
    await user.hover(failed);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Couldn't load the preview.");

    await user.click(failed);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("names the file instead of a preview when it plays a local file", () => {
    renderButton({ subject: "file" });

    expect(screen.getByRole("button", { name: "Play the file Aerodynamic" })).toBeInTheDocument();
  });
});

describe("PreviewTime", () => {
  it("shows the elapsed time over the clip length", () => {
    renderWithProviders(<PreviewTime clock={{ elapsedSeconds: 12.6, totalSeconds: 30 }} />);

    expect(screen.getByText("0:12 / 0:30")).toBeInTheDocument();
  });
});
