import { afterEach, describe, expect, it } from "vitest";

import { AUTO_TITLE_ATTRIBUTE, handleTruncationHover, syncTruncationTitle } from "../truncation-title";

function cell(text: string, width: { scroll: number; client: number }, style = "text-overflow: ellipsis"): HTMLElement {
  const element = document.createElement("span");
  element.setAttribute("style", style);
  element.textContent = text;
  Object.defineProperty(element, "scrollWidth", { configurable: true, value: width.scroll });
  Object.defineProperty(element, "clientWidth", { configurable: true, value: width.client });
  document.body.append(element);
  return element;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("truncation titles", () => {
  it("gives text that is really cut its whole text as the native label", () => {
    const element = cell("A very long album title", { scroll: 300, client: 120 });

    syncTruncationTitle(element);

    expect(element.getAttribute("title")).toBe("A very long album title");
    expect(element).toHaveAttribute(AUTO_TITLE_ATTRIBUTE);
  });

  it("adds nothing to text that fits", () => {
    const element = cell("Short", { scroll: 100, client: 120 });

    syncTruncationTitle(element);

    expect(element).not.toHaveAttribute("title");
  });

  it("leaves an element that has its own title alone", () => {
    const element = cell("Long text", { scroll: 300, client: 120 });
    element.setAttribute("title", "Chosen by the author");

    syncTruncationTitle(element);

    expect(element.getAttribute("title")).toBe("Chosen by the author");
    expect(element).not.toHaveAttribute(AUTO_TITLE_ATTRIBUTE);
  });

  it("takes back the label it added once the text fits", () => {
    const element = cell("Long text", { scroll: 300, client: 120 });
    syncTruncationTitle(element);
    Object.defineProperty(element, "scrollWidth", { configurable: true, value: 100 });

    syncTruncationTitle(element);

    expect(element).not.toHaveAttribute("title");
    expect(element).not.toHaveAttribute(AUTO_TITLE_ATTRIBUTE);
  });

  it("finds the cut element from a child under the pointer", () => {
    const element = cell("Parent text", { scroll: 300, client: 120 });
    const child = document.createElement("b");
    child.textContent = "inner";
    element.append(child);

    document.addEventListener("mouseover", handleTruncationHover, true);
    child.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    document.removeEventListener("mouseover", handleTruncationHover, true);

    expect(element).toHaveAttribute("title");
  });

  it("clamps count as cut text when the box is shorter than its content", () => {
    const element = document.createElement("p");
    element.setAttribute("style", "-webkit-line-clamp: 2");
    element.textContent = "Many lines of text";
    Object.defineProperty(element, "scrollHeight", { configurable: true, value: 90 });
    Object.defineProperty(element, "clientHeight", { configurable: true, value: 40 });
    document.body.append(element);

    syncTruncationTitle(element);

    expect(element.getAttribute("title")).toBe("Many lines of text");
  });
});
