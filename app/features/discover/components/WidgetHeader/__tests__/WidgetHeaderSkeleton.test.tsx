import { describe, expect, it } from "vitest";

import { render } from "@test/test-utils";

import { WidgetHeaderSkeleton } from "../WidgetHeaderSkeleton";

describe("WidgetHeaderSkeleton", () => {
  it("renders pulsing placeholders for the icon, title and subtitle", () => {
    const { container } = render(<WidgetHeaderSkeleton />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("renders no heading or text so it never leaks placeholder copy", () => {
    const { container } = render(<WidgetHeaderSkeleton />);

    expect(container.querySelector("h2, h3")).toBeNull();
    expect(container.textContent).toBe("");
  });
});
