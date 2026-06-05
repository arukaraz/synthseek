import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, ...props }: React.ComponentProps<"button">) => <button {...props}>{children}</button>,
  },
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OptionGrid } from "../OptionGrid";

const OPTIONS = [
  { value: 320, label: "320 kbps", description: "Best" },
  { value: 256, label: "256 kbps", description: "High" },
];

describe("OptionGrid", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the label and every option", () => {
    render(<OptionGrid label="Bitrate" options={OPTIONS} value={320} onChange={vi.fn()} />);

    expect(screen.getByText("Bitrate")).toBeInTheDocument();
    expect(screen.getByText("320 kbps")).toBeInTheDocument();
    expect(screen.getByText("256 kbps")).toBeInTheDocument();
  });

  it("invokes onChange with the option value when clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<OptionGrid label="Bitrate" options={OPTIONS} value={320} onChange={onChange} />);

    await user.click(screen.getByText("256 kbps"));

    expect(onChange).toHaveBeenCalledWith(256);
  });

  it("renders the checkmark for the selected option when enabled", () => {
    render(<OptionGrid label="Bitrate" options={OPTIONS} value={320} onChange={vi.fn()} showCheckmark />);

    const selected = screen.getByText("320 kbps").closest("button");
    expect(selected?.querySelector("svg")).not.toBeNull();
  });

  it("disables interaction and marks the group aria-disabled", () => {
    render(<OptionGrid label="Bitrate" options={OPTIONS} value={320} onChange={vi.fn()} disabled columns={4} />);

    const group = screen.getByText("Bitrate").closest("[aria-disabled]");
    expect(group).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("320 kbps").closest("button")).toBeDisabled();
  });
});
