import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { InlineMarkdown } from "../InlineMarkdown";

afterEach(() => {
  cleanup();
});

describe("InlineMarkdown", () => {
  it("renders plain text as is", () => {
    render(<InlineMarkdown text="just words" />);
    expect(screen.getByText("just words")).toBeInTheDocument();
  });

  it("renders a bold segment inside a strong element", () => {
    render(<InlineMarkdown text="a **strong** b" />);
    const strong = screen.getByText("strong");
    expect(strong.tagName).toBe("STRONG");
  });

  it("renders inline code inside a code element without normalizing whitespace", () => {
    render(<InlineMarkdown text="run `npm  test`" />);
    const code = screen.getByText("npm  test", { normalizer: (value) => value });
    expect(code.tagName).toBe("CODE");
    expect(code.textContent).toBe("npm  test");
  });

  it("renders a link with a safe external target", () => {
    render(<InlineMarkdown text="see [#42](https://example.com/42)" />);
    const link = screen.getByRole("link", { name: "#42" });
    expect(link).toHaveAttribute("href", "https://example.com/42");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("collapses whitespace inside text and bold tokens", () => {
    render(<InlineMarkdown text={"first\n  line **bold\n  text**"} />);
    expect(screen.getByText("first line")).toBeInTheDocument();
    expect(screen.getByText("bold text")).toBeInTheDocument();
  });

  it("renders a mix of every token type", () => {
    render(<InlineMarkdown text="text **b** `c` [d](https://x.test)" />);
    expect(screen.getByText("b").tagName).toBe("STRONG");
    expect(screen.getByText("c").tagName).toBe("CODE");
    expect(screen.getByRole("link", { name: "d" })).toHaveAttribute("href", "https://x.test");
  });
});
