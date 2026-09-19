import { renderWithProviders, screen } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { QueueAddButton } from "../QueueAddButton";

const labels = { label: "Add Aerodynamic to the queue", confirmedLabel: "Aerodynamic is already in the queue" };

describe("QueueAddButton", () => {
  it("offers the add affordance for a track that is not in the queue", () => {
    renderWithProviders(<QueueAddButton onAdd={async () => true} {...labels} />);

    expect(screen.getByLabelText(labels.label)).toBeInTheDocument();
    expect(screen.queryByLabelText(labels.confirmedLabel)).not.toBeInTheDocument();
  });

  it("shows the queued affordance for a track already in the queue, before any click", () => {
    renderWithProviders(<QueueAddButton onAdd={async () => true} inQueue {...labels} />);

    expect(screen.getByLabelText(labels.confirmedLabel)).toBeInTheDocument();
    expect(screen.queryByLabelText(labels.label)).not.toBeInTheDocument();
  });

  it("keeps the queued affordance visible rather than reverting it after a moment", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderWithProviders(<QueueAddButton onAdd={async () => true} inQueue {...labels} />);
      await vi.advanceTimersByTimeAsync(10000);
      expect(screen.getByLabelText(labels.confirmedLabel)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not reveal-on-hover a button that already reads as queued", () => {
    const { container } = renderWithProviders(
      <QueueAddButton onAdd={async () => true} inQueue revealOnHover {...labels} />
    );

    expect(container.querySelector("button")?.className).not.toContain("sm:opacity-0");
  });
});
