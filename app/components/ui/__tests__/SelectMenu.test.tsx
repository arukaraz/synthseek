import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SelectMenu } from "../SelectMenu";

const OPTIONS = [
  { value: "music", label: "Music", description: "/music" },
  { value: "archive", label: "Archive", description: "/mnt/archive" },
];

describe("SelectMenu", () => {
  it("shows the chosen option on the trigger, or the placeholder before a choice", () => {
    const { rerender } = render(
      <SelectMenu value={null} options={OPTIONS} onChange={vi.fn()} ariaLabel="Path" placeholder="Pick one" />
    );
    expect(screen.getByRole("button", { name: "Path" })).toHaveTextContent("Pick one");

    rerender(<SelectMenu value="archive" options={OPTIONS} onChange={vi.fn()} ariaLabel="Path" />);
    expect(screen.getByRole("button", { name: "Path" })).toHaveTextContent("Archive");
  });

  it("hands back the option picked, with its own value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectMenu value="music" options={OPTIONS} onChange={onChange} ariaLabel="Path" />);

    await user.click(screen.getByRole("button", { name: "Path" }));
    await user.click(await screen.findByRole("menuitemradio", { name: /Archive/ }));

    expect(onChange).toHaveBeenCalledWith("archive");
  });

  it("lines its options up on the left, where the column layout would otherwise center them", async () => {
    const user = userEvent.setup();
    render(<SelectMenu value="music" options={OPTIONS} onChange={vi.fn()} ariaLabel="Path" />);

    await user.click(screen.getByRole("button", { name: "Path" }));
    const option = await screen.findByRole("menuitemradio", { name: /Archive/ });

    expect(option).toHaveClass("items-start");
    expect(option).not.toHaveClass("items-center");
  });

  it("keeps a numeric value numeric", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SelectMenu
        value={1}
        options={[
          { value: 1, label: "One" },
          { value: 2, label: "Two" },
        ]}
        onChange={onChange}
        ariaLabel="Count"
      />
    );

    await user.click(screen.getByRole("button", { name: "Count" }));
    await user.click(await screen.findByRole("menuitemradio", { name: "Two" }));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("shows the chosen option's description on the large trigger only", () => {
    const { rerender } = render(
      <SelectMenu value="archive" options={OPTIONS} onChange={vi.fn()} ariaLabel="Path" size="lg" />
    );
    expect(screen.getByRole("button", { name: "Path" })).toHaveTextContent("/mnt/archive");

    rerender(<SelectMenu value="archive" options={OPTIONS} onChange={vi.fn()} ariaLabel="Path" />);
    expect(screen.getByRole("button", { name: "Path" })).not.toHaveTextContent("/mnt/archive");
  });

  it("cannot be opened while disabled", () => {
    render(<SelectMenu value="music" options={OPTIONS} onChange={vi.fn()} ariaLabel="Path" disabled />);

    expect(screen.getByRole("button", { name: "Path" })).toBeDisabled();
  });
});
