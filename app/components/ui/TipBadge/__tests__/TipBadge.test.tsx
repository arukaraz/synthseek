import { afterEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";

import { renderWithProviders, screen } from "@test/test-utils";

import { TIPS_SEEN_STORAGE_KEY } from "../constants";
import { TipBadge } from "../TipBadge";

function renderTip() {
  return renderWithProviders(
    <TipBadge
      tipId="theme-by-ai"
      body="An assistant can build this theme."
      action={{ label: "Connect one", href: "/settings/connections/apps#ai-assistants" }}
    />
  );
}

afterEach(() => {
  window.localStorage.clear();
});

describe("TipBadge", () => {
  it("pulses until it is opened once, and stays calm after that", async () => {
    const first = renderTip();
    const badge = screen.getByRole("button", { name: "Tip" });
    expect(badge.className).toContain("animate-tip-halo");

    await userEvent.click(badge);

    expect(screen.getByText("An assistant can build this theme.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Connect one/ })).toHaveAttribute(
      "href",
      "/settings/connections/apps#ai-assistants"
    );
    expect(JSON.parse(window.localStorage.getItem(TIPS_SEEN_STORAGE_KEY) ?? "[]")).toEqual(["theme-by-ai"]);

    first.unmount();
    renderTip();
    expect(screen.getByRole("button", { name: "Tip" }).className).not.toContain("animate-tip-halo");
  });
});
