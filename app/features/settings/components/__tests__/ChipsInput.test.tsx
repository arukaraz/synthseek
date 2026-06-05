import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChipsInput } from "../ChipsInput";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ChipsInput", () => {
  it("renders existing chips", () => {
    render(<ChipsInput value={["one", "two"]} onChange={vi.fn()} />);
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
  });

  it("commits a chip on Enter", async () => {
    const onChange = vi.fn();
    render(<ChipsInput value={[]} onChange={onChange} placeholder="add tag" />);

    await userEvent.type(screen.getByPlaceholderText("add tag"), "rock{Enter}");
    expect(onChange).toHaveBeenCalledWith(["rock"]);
  });

  it("commits a chip on comma", async () => {
    const onChange = vi.fn();
    render(<ChipsInput value={["rock"]} onChange={onChange} placeholder="add tag" />);

    await userEvent.type(screen.getByRole("textbox"), "jazz,");
    expect(onChange).toHaveBeenCalledWith(["rock", "jazz"]);
  });

  it("commits a chip on blur", async () => {
    const onChange = vi.fn();
    render(<ChipsInput value={[]} onChange={onChange} placeholder="add tag" />);

    const input = screen.getByPlaceholderText("add tag");
    await userEvent.type(input, "pop");
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(["pop"]);
  });

  it("ignores duplicate and empty chips", async () => {
    const onChange = vi.fn();
    render(<ChipsInput value={["rock"]} onChange={onChange} placeholder="add tag" />);

    await userEvent.type(screen.getByRole("textbox"), "rock{Enter}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes the last chip on Backspace with an empty draft", async () => {
    const onChange = vi.fn();
    render(<ChipsInput value={["one", "two"]} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    input.focus();
    await userEvent.keyboard("{Backspace}");
    expect(onChange).toHaveBeenCalledWith(["one"]);
  });

  it("removes a chip via its remove button", async () => {
    const onChange = vi.fn();
    render(<ChipsInput value={["one", "two"]} onChange={onChange} />);

    await userEvent.click(screen.getByLabelText("Remove one"));
    expect(onChange).toHaveBeenCalledWith(["two"]);
  });

  it("does not render a placeholder when chips exist", () => {
    render(<ChipsInput value={["one"]} onChange={vi.fn()} placeholder="add tag" />);
    expect(screen.queryByPlaceholderText("add tag")).not.toBeInTheDocument();
  });
});
