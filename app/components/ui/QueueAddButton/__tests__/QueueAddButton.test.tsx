import { renderWithProviders, screen } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { QueueAddButton } from "../QueueAddButton";

const title = "Aerodynamic";
const addLabel = "Add Aerodynamic to the queue";
const removeLabel = "Remove Aerodynamic from the queue";

function renderButton(props: Partial<Parameters<typeof QueueAddButton>[0]> = {}) {
  const onAdd = vi.fn(async () => true);
  const onRemove = vi.fn();
  const rendered = renderWithProviders(
    <QueueAddButton title={title} presence="absent" onAdd={onAdd} onRemove={onRemove} {...props} />
  );
  return { ...rendered, onAdd, onRemove };
}

describe("QueueAddButton", () => {
  it("offers to add a track that is not in the queue", async () => {
    const { user, onAdd } = renderButton();

    await user.click(screen.getByRole("button", { name: addLabel }));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("offers to remove a track that is waiting in the queue, instead of adding it again", async () => {
    const { user, onAdd, onRemove } = renderButton({ presence: "upcoming" });

    await user.click(screen.getByRole("button", { name: removeLabel }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("shows the now-playing bars instead of a button for the track that is playing", () => {
    renderButton({ presence: "playing" });

    expect(screen.getByRole("img", { name: "Aerodynamic is playing" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("freezes the bars for the current track while it is paused", () => {
    renderButton({ presence: "paused" });

    expect(screen.getByRole("img", { name: "Aerodynamic is paused" })).toHaveAttribute("data-paused");
  });

  it("does not remove a track on a second click that lands before the pointer left the button", async () => {
    const onRemove = vi.fn();
    const { user, rerender } = renderWithProviders(
      <QueueAddButton title={title} presence="absent" onAdd={async () => true} onRemove={onRemove} />
    );

    await user.click(screen.getByRole("button", { name: addLabel }));
    rerender(<QueueAddButton title={title} presence="upcoming" onAdd={async () => true} onRemove={onRemove} />);
    await user.click(screen.getByRole("button", { name: removeLabel }));

    expect(onRemove).not.toHaveBeenCalled();
  });

  it("does not reveal-on-hover a button that already reads as queued", () => {
    const { container } = renderButton({ presence: "upcoming", revealOnHover: true });

    expect(container.querySelector("button")?.className).not.toContain("sm:opacity-0");
  });
});
