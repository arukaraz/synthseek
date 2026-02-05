import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "../Checkbox";

describe("Checkbox", () => {
  it("renders unchecked by default", () => {
    render(<Checkbox aria-label="Test checkbox" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("can be checked via click", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Test checkbox" />);
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("can be toggled off", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Test checkbox" defaultChecked />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("disabled state prevents interaction", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox aria-label="Disabled checkbox" disabled onCheckedChange={handleChange} />);
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(handleChange).not.toHaveBeenCalled();
    expect(checkbox).not.toBeChecked();
  });

  it("accepts custom className", () => {
    render(<Checkbox aria-label="Styled checkbox" className="custom-class" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("custom-class");
  });

  it("works in controlled mode with checked prop", () => {
    const { rerender } = render(<Checkbox aria-label="Controlled" checked={false} />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();

    rerender(<Checkbox aria-label="Controlled" checked={true} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("fires onCheckedChange callback", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox aria-label="Callback test" onCheckedChange={handleChange} />);
    await user.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("renders with proper border styling", () => {
    render(<Checkbox aria-label="Styled" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("border", "border-primary");
  });

  it("applies focus-visible ring classes", () => {
    render(<Checkbox aria-label="Focus test" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("focus-visible:ring-2");
  });
});
