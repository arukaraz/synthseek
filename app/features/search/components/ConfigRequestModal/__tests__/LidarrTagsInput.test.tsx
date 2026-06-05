import { describe, expect, it, vi, afterEach } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LidarrTagsInput } from "../LidarrTagsInput";

function renderInput(value: string[], onChange = vi.fn()) {
  render(<LidarrTagsInput label="Tags" value={value} onChange={onChange} suggestions={["hi-fi", "favorites"]} />);
  return onChange;
}

describe("LidarrTagsInput", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the label and the current tags as chips", () => {
    renderInput(["hi-fi"]);

    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByText("hi-fi")).toBeInTheDocument();
  });

  it("removes a tag when its remove button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = renderInput(["hi-fi", "favorites"]);

    await user.click(screen.getByRole("button", { name: /hi-fi/i }));

    expect(onChange).toHaveBeenCalledWith(["favorites"]);
  });

  it("commits a new tag on Enter", async () => {
    const user = userEvent.setup();
    const onChange = renderInput([]);

    const input = screen.getByLabelText("Tags");
    await user.type(input, "rock");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(["rock"]);
  });

  it("commits a new tag on comma", async () => {
    const user = userEvent.setup();
    const onChange = renderInput([]);

    const input = screen.getByLabelText("Tags");
    await user.type(input, "jazz,");

    expect(onChange).toHaveBeenCalledWith(["jazz"]);
  });

  it("does not commit an empty draft on Enter", async () => {
    const user = userEvent.setup();
    const onChange = renderInput([]);

    const input = screen.getByLabelText("Tags");
    input.focus();
    await user.keyboard("{Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes the last tag on Backspace when the draft is empty", async () => {
    const user = userEvent.setup();
    const onChange = renderInput(["hi-fi", "favorites"]);

    const input = screen.getByLabelText("Tags");
    input.focus();
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenCalledWith(["hi-fi"]);
  });

  it("does not remove a tag on Backspace when there are no tags", async () => {
    const user = userEvent.setup();
    const onChange = renderInput([]);

    const input = screen.getByLabelText("Tags");
    input.focus();
    await user.keyboard("{Backspace}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows the placeholder only while no tags are selected", () => {
    const { rerender } = render(<LidarrTagsInput label="Tags" value={[]} onChange={vi.fn()} suggestions={[]} />);
    expect(screen.getByLabelText("Tags")).toHaveAttribute("placeholder");

    rerender(<LidarrTagsInput label="Tags" value={["hi-fi"]} onChange={vi.fn()} suggestions={[]} />);
    expect(screen.getByLabelText("Tags")).toHaveAttribute("placeholder", "");
  });
});
