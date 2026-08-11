import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/settings/integrations/download-sources" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { clearHashTargetGlow } from "@utils/hash-target-glow";

import { HashLink } from "../HashLink";
import { splitHashHref } from "../helpers";

const GLOW_ATTR = "data-glow";
const SAME_PAGE_HREF = "/settings/integrations/download-sources#ban-threshold";

function renderWithTarget(href: string) {
  const target = document.createElement("div");
  target.setAttribute("data-anchor-target", "ban-threshold");
  document.body.appendChild(target);

  render(<HashLink href={href}>Configure threshold</HashLink>);

  return target;
}

describe("HashLink", () => {
  beforeEach(() => {
    navigation.pathname = "/settings/integrations/download-sources";
    Element.prototype.scrollIntoView = vi.fn();
    window.history.replaceState({}, "", "/settings/integrations/download-sources");
    document.body.innerHTML = "";
  });

  afterEach(() => {
    clearHashTargetGlow();
  });

  it("renders an anchor carrying the full href so the hash stays shareable", () => {
    renderWithTarget(SAME_PAGE_HREF);

    expect(screen.getByRole("link", { name: "Configure threshold" })).toHaveAttribute("href", SAME_PAGE_HREF);
  });

  it("marks the target on a same-page click, with no pathname change involved", async () => {
    const user = userEvent.setup();
    const target = renderWithTarget(SAME_PAGE_HREF);

    await user.click(screen.getByRole("link", { name: "Configure threshold" }));

    expect(target.hasAttribute(GLOW_ATTR)).toBe(true);
  });

  it("marks the target again on a repeat click of an already-set hash", async () => {
    const user = userEvent.setup();
    const target = renderWithTarget(SAME_PAGE_HREF);
    const link = screen.getByRole("link", { name: "Configure threshold" });

    await user.click(link);
    target.removeAttribute(GLOW_ATTR);
    await user.click(link);

    expect(target.hasAttribute(GLOW_ATTR)).toBe(true);
  });

  it("leaves a cross-page link to the navigation-driven hook", async () => {
    const user = userEvent.setup();
    navigation.pathname = "/settings/engine";
    const target = renderWithTarget(SAME_PAGE_HREF);

    await user.click(screen.getByRole("link", { name: "Configure threshold" }));

    expect(target.hasAttribute(GLOW_ATTR)).toBe(false);
  });
});

describe("splitHashHref", () => {
  it("splits a path and its anchor", () => {
    expect(splitHashHref(SAME_PAGE_HREF)).toEqual({
      path: "/settings/integrations/download-sources",
      hash: "ban-threshold",
    });
  });

  it("returns an empty hash for a plain path", () => {
    expect(splitHashHref("/settings/engine")).toEqual({ path: "/settings/engine", hash: "" });
  });
});
