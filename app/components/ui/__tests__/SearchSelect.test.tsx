import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { SearchSelect } from "../SearchSelect";

const OPTIONS = [
  { value: "any", label: "Worldwide" },
  { value: "MX", label: "Mexico" },
  { value: "DE", label: "Germany" },
  { value: "ES", label: "Spain" },
];

function renderSelect(value: string, onChange = vi.fn()) {
  render(
    <SearchSelect
      value={value}
      options={OPTIONS}
      onChange={onChange}
      ariaLabel="Country"
      searchPlaceholder="Search a country"
      emptyText="No country matches."
    />
  );
  return onChange;
}

describe("SearchSelect", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("shows the chosen option on the trigger", () => {
    renderSelect("DE");

    expect(screen.getByRole("button", { name: "Country" })).toHaveTextContent("Germany");
  });

  it("opens on a search box, narrows the list as the member types, and hands back the option picked", async () => {
    const user = userEvent.setup();
    const onChange = renderSelect("any");

    await user.click(screen.getByRole("button", { name: "Country" }));
    const search = await screen.findByRole("combobox", { name: "Search a country" });
    expect(search).toHaveFocus();
    await user.type(search, "mex");

    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Mexico"]);
    await user.click(screen.getByRole("option", { name: "Mexico" }));

    expect(onChange).toHaveBeenCalledWith("MX");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("says so when nothing matches", async () => {
    const user = userEvent.setup();
    renderSelect("any");

    await user.click(screen.getByRole("button", { name: "Country" }));
    await user.type(await screen.findByRole("combobox"), "zzzz");

    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No country matches.")).toBeInTheDocument();
  });

  it("starts the keyboard on the chosen option and picks with Enter", async () => {
    const user = userEvent.setup();
    const onChange = renderSelect("MX");

    await user.click(screen.getByRole("button", { name: "Country" }));
    await screen.findByRole("combobox");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith("DE");
  });

  it("marks only the chosen option as selected", async () => {
    const user = userEvent.setup();
    renderSelect("ES");

    await user.click(screen.getByRole("button", { name: "Country" }));

    expect((await screen.findAllByRole("option", { selected: true })).map((option) => option.textContent)).toEqual([
      "Spain",
    ]);
  });
});
