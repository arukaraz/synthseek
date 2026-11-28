import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { axeViolations, expectNoAxeViolations } from "./axe";

describe("the axe helper", () => {
  it("passes a labelled control", async () => {
    render(
      <label>
        Name
        <input type="text" />
      </label>
    );
    await expectNoAxeViolations();
  });

  it("fails a button inside a button", async () => {
    render(
      <button type="button">
        Outer
        <button type="button">Inner</button>
      </button>
    );
    const violations = await axeViolations();
    expect(violations.some((line) => line.startsWith("nested-interactive"))).toBe(true);
    await expect(expectNoAxeViolations()).rejects.toThrow("nested-interactive");
  });

  it("fails an input with no name", async () => {
    render(<input type="text" />);
    expect((await axeViolations()).some((line) => line.startsWith("label"))).toBe(true);
  });

  it("fails a list with a child that is not an item", async () => {
    render(
      <ul>
        <div>stray</div>
      </ul>
    );
    expect((await axeViolations()).some((line) => line.startsWith("list"))).toBe(true);
  });

  it("does not decide the page-level rules or contrast", async () => {
    render(<p style={{ color: "#777", background: "#888" }}>Faint</p>);
    await expectNoAxeViolations();
  });
});
