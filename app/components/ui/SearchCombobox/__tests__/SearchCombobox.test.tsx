import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SearchCombobox } from "../SearchCombobox";

const OPTIONS = [
  { value: "mago", label: "Mägo de Oz" },
  { value: "heroes", label: "Héroes del Silencio" },
];

function Harness({ initial }: { initial?: string }) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(initial);
  return (
    <SearchCombobox
      label="Artist"
      placeholder="Search"
      selected={picked}
      options={OPTIONS}
      query={query}
      onQueryChange={setQuery}
      onPick={(option) => setPicked(option.label)}
    />
  );
}

describe("SearchCombobox", () => {
  it("shows the chosen value as text, not as the placeholder", () => {
    render(<Harness initial="Mägo de Oz" />);

    const input = screen.getByRole("combobox", { name: "Artist" });
    expect(input).toHaveValue("Mägo de Oz");
    expect(input).toHaveAttribute("placeholder", "Search");
  });

  it("shows a newly picked value once the pick is made", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("combobox", { name: "Artist" });

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "Héroes del Silencio" }));

    expect(input).toHaveValue("Héroes del Silencio");
  });

  it("replaces the chosen value while typing and brings it back when left without a pick", async () => {
    const user = userEvent.setup();
    render(<Harness initial="Mägo de Oz" />);
    const input = screen.getByRole("combobox", { name: "Artist" });

    await user.click(input);
    await user.keyboard("Hé");
    expect(input).toHaveValue("Hé");

    await user.tab();
    expect(input).toHaveValue("Mägo de Oz");
  });
});
