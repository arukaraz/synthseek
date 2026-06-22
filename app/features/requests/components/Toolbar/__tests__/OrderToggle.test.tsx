import { render, screen, userEvent } from "@test/test-utils";
import { ArrowUp } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { OrderToggle } from "../OrderToggle";

describe("OrderToggle", () => {
  it("reflects the active state through aria-pressed and renders the label", () => {
    render(<OrderToggle isActive label="Ascending" icon={ArrowUp} onClick={() => {}} />);

    const button = screen.getByRole("button", { name: "Ascending" });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("marks aria-pressed false when inactive", () => {
    render(<OrderToggle isActive={false} label="Descending" icon={ArrowUp} onClick={() => {}} />);

    expect(screen.getByRole("button", { name: "Descending" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<OrderToggle isActive={false} label="Ascending" icon={ArrowUp} onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Ascending" }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
