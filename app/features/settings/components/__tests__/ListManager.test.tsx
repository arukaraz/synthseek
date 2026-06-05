import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ListManager } from "../ListManager";

import enSettings from "@modules/i18n/messages/en/settings.json";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ListManager", () => {
  it("renders the empty state and a count of zero", () => {
    render(<ListManager value={[]} onChange={vi.fn()} />);
    expect(screen.getByText(enSettings.shell.listManager.empty)).toBeInTheDocument();
    expect(screen.getByText("0 items")).toBeInTheDocument();
  });

  it("renders existing items", () => {
    render(<ListManager value={["alpha", "beta"]} onChange={vi.fn()} />);
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("adds a trimmed item via the add button", async () => {
    const onChange = vi.fn();
    render(<ListManager value={["alpha"]} onChange={onChange} />);

    await userEvent.type(screen.getByPlaceholderText(enSettings.shell.listManager.addPlaceholder), "  beta  ");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.listManager.add }));

    expect(onChange).toHaveBeenCalledWith(["alpha", "beta"]);
  });

  it("adds an item when pressing Enter", async () => {
    const onChange = vi.fn();
    render(<ListManager value={[]} onChange={onChange} />);

    await userEvent.type(screen.getByPlaceholderText(enSettings.shell.listManager.addPlaceholder), "gamma{Enter}");
    expect(onChange).toHaveBeenCalledWith(["gamma"]);
  });

  it("does not add duplicates or empty values", async () => {
    const onChange = vi.fn();
    render(<ListManager value={["alpha"]} onChange={onChange} />);

    await userEvent.type(screen.getByPlaceholderText(enSettings.shell.listManager.addPlaceholder), "alpha{Enter}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes an item", async () => {
    const onChange = vi.fn();
    render(<ListManager value={["alpha", "beta"]} onChange={onChange} />);

    await userEvent.click(screen.getByLabelText("Remove alpha"));
    expect(onChange).toHaveBeenCalledWith(["beta"]);
  });

  it("shows a filter once past the threshold and filters items", async () => {
    const onChange = vi.fn();
    const value = ["apple", "apricot", "banana", "cherry", "date", "elderberry"];
    render(<ListManager value={value} onChange={onChange} />);

    const filter = screen.getByPlaceholderText(enSettings.shell.listManager.filterPlaceholder);
    await userEvent.type(filter, "ap");

    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText("apricot")).toBeInTheDocument();
    expect(screen.queryByText("banana")).not.toBeInTheDocument();
    expect(screen.getByText("2 of 6")).toBeInTheDocument();
  });

  it("shows the no-matches message for a non-matching filter", async () => {
    const value = ["apple", "apricot", "banana", "cherry", "date", "elderberry"];
    render(<ListManager value={value} onChange={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText(enSettings.shell.listManager.filterPlaceholder), "zzz");
    expect(screen.getByText(/zzz/)).toBeInTheDocument();
  });

  it("renders custom labels and helper text", () => {
    render(
      <ListManager
        value={[]}
        onChange={vi.fn()}
        emptyLabel="Nothing here"
        countLabel={(n) => `total ${n}`}
        helper="A helper hint"
      />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("total 0")).toBeInTheDocument();
    expect(screen.getByText("A helper hint")).toBeInTheDocument();
  });
});
