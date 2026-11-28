import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InlineError } from "../InlineError";

describe("InlineError", () => {
  it("renders nothing while nothing has failed", () => {
    const { container } = render(<InlineError error={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("carries the failure's message in an alert next to what failed", () => {
    render(<InlineError error={new Error("The folder is not writable")} />);

    expect(screen.getByText("The folder is not writable", { selector: "span" })).toBeInTheDocument();
  });

  it("is hidden until the accessibility mode is on, so the page stays as it was", () => {
    const { container } = render(<InlineError error={new Error("It broke")} />);
    const wrapper = container.querySelector("[data-inline-error]");

    expect(wrapper?.className).toContain("hidden");
    expect(wrapper?.className).toContain("a11y-mode:block");
  });
});
