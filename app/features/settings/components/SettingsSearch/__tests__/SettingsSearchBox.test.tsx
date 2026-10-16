import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { SEARCH_INPUT_ID } from "../constants";
import { SettingsSearchBox } from "../SettingsSearchBox";

const copy = enSettings.shell.search;

function renderBox(value: string) {
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  render(<SettingsSearchBox value={value} onChange={onChange} onSubmit={onSubmit} />);
  return { onChange, onSubmit, input: screen.getByRole("textbox", { name: copy.label }) };
}

describe("SettingsSearchBox", () => {
  it("renders a search landmark whose input the shortcut can focus", () => {
    const { input } = renderBox("");
    expect(screen.getByRole("search")).toContainElement(input);
    expect(input).toHaveAttribute("id", SEARCH_INPUT_ID);
    expect(input).toHaveAttribute("placeholder", copy.placeholder);
  });

  it("reports each change of the text", () => {
    const { input, onChange } = renderBox("");
    fireEvent.change(input, { target: { value: "plex" } });
    expect(onChange).toHaveBeenCalledWith("plex");
  });

  it("clears the query on Escape", async () => {
    const { input, onChange, onSubmit } = renderBox("plex");
    input.focus();
    await userEvent.keyboard("{Escape}");
    expect(onChange).toHaveBeenCalledWith("");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits on Enter", async () => {
    const { input, onChange, onSubmit } = renderBox("plex");
    input.focus();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("offers a clear button instead of the shortcut hint once there is a query", async () => {
    const { onChange } = renderBox("plex");
    expect(screen.queryByText(copy.shortcut)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: copy.clear }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("shows the shortcut hint and no clear button while empty", () => {
    renderBox("");
    expect(screen.getByText(copy.shortcut)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: copy.clear })).not.toBeInTheDocument();
  });
});
