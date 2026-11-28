import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { toast } from "sonner";

import { Toaster } from "../Toaster";

afterEach(() => {
  toast.dismiss();
});

async function tabInto(user: UserEvent, target: Element, options: { shift?: boolean } = {}): Promise<void> {
  for (let stop = 0; stop < 12; stop++) {
    await user.tab(options);
    if (target.contains(document.activeElement)) return;
  }
  throw new Error("the keyboard never reached the target");
}

async function findToast(title: string): Promise<HTMLElement> {
  const titleNode = await screen.findByText(title);
  const toastNode = titleNode.closest("[data-sonner-toast]");
  if (!(toastNode instanceof HTMLElement)) throw new Error("toast element not found");
  return toastNode;
}

describe("Toaster", () => {
  it("renders the variant data-type, the title, and the optional description", async () => {
    render(<Toaster />);
    toast.success("Saved", { description: "https://example.com/track" });

    const toastNode = await findToast("Saved");
    expect(toastNode).toHaveAttribute("data-type", "success");
    expect(within(toastNode).getByText("https://example.com/track")).toBeInTheDocument();
  });

  it("renders the title alone when no description is passed", async () => {
    render(<Toaster />);
    toast.info("Heads up");

    const toastNode = await findToast("Heads up");
    expect(toastNode).toHaveAttribute("data-type", "info");
    expect(toastNode.querySelector("[data-description]")).toBeNull();
  });

  it("drives appearance itself rather than Sonner rich colors", async () => {
    render(<Toaster />);
    toast.error("Something broke");

    const toastNode = await findToast("Something broke");
    expect(toastNode).toHaveAttribute("data-type", "error");
    expect(toastNode).not.toHaveAttribute("data-rich-colors", "true");
  });

  it("renders a colored-badge glyph for every variant", async () => {
    render(<Toaster />);
    toast.success("ok");
    toast.error("bad");
    toast.warning("careful");
    toast.info("note");

    for (const title of ["ok", "bad", "careful", "note"]) {
      const toastNode = await findToast(title);
      const icon = toastNode.querySelector("[data-icon] svg");
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("hands Sonner one bottom offset for both widths, so the switch follows the app's breakpoint", async () => {
    render(<Toaster />);
    toast.success("Placed");

    await findToast("Placed");
    const toaster = document.querySelector("[data-sonner-toaster]");
    if (!(toaster instanceof HTMLElement)) throw new Error("toaster element not found");
    expect(toaster.style.getPropertyValue("--offset-bottom")).toBe("var(--toast-offset-bottom)");
    expect(toaster.style.getPropertyValue("--mobile-offset-bottom")).toBe("var(--toast-offset-bottom)");
    expect(toaster.style.getPropertyValue("--toast-offset-mobile")).toContain("var(--height-bottom-nav)");
    expect(toaster.style.getPropertyValue("--toast-offset-wide")).not.toContain("--height-bottom-nav");
  });

  it("reads the player bar's height where it sits, so a toast clears the bar at every width", async () => {
    render(<Toaster />);
    toast.success("Cleared");

    await findToast("Cleared");
    const toaster = document.querySelector("[data-sonner-toaster]");
    if (!(toaster instanceof HTMLElement)) throw new Error("toaster element not found");
    expect(toaster).toHaveClass("player-metrics");
  });

  it("opens the stack while the keyboard is inside it, so the toast behind is not focused unseen", async () => {
    render(<Toaster />);
    toast.error("First failure");
    toast.error("Second failure");
    const behind = await findToast("First failure");
    const front = await findToast("Second failure");
    await waitFor(() => expect(behind).toHaveAttribute("data-front", "false"));
    expect(behind).toHaveAttribute("data-expanded", "false");

    await tabInto(userEvent.setup(), behind);

    expect(behind).toHaveAttribute("data-expanded", "true");
    expect(front).toHaveAttribute("data-expanded", "true");
  });

  it("closes the stack again when the keyboard leaves it", async () => {
    render(
      <>
        <button type="button">Elsewhere</button>
        <Toaster />
      </>
    );
    toast.error("First failure");
    toast.error("Second failure");
    const behind = await findToast("First failure");
    await waitFor(() => expect(behind).toHaveAttribute("data-front", "false"));
    const user = userEvent.setup();
    await tabInto(user, behind);
    expect(behind).toHaveAttribute("data-expanded", "true");

    await tabInto(user, screen.getByRole("button", { name: "Elsewhere" }), { shift: true });

    await waitFor(() => expect(behind).toHaveAttribute("data-expanded", "false"));
  });

  it("stays open at every stop while the keyboard moves from one toast to the next", async () => {
    render(<Toaster />);
    toast.error("First failure");
    toast.error("Second failure");
    const behind = await findToast("First failure");
    const front = await findToast("Second failure");
    await waitFor(() => expect(behind).toHaveAttribute("data-front", "false"));
    const user = userEvent.setup();
    const collapsedAt: string[] = [];
    const seen = new Set<Element>();

    for (let stop = 0; stop < 6; stop++) {
      await user.tab();
      const active = document.activeElement;
      const toastNode = active?.closest("[data-sonner-toast]") ?? null;
      if (toastNode === null) continue;
      seen.add(toastNode);
      if (toastNode.getAttribute("data-expanded") !== "true") collapsedAt.push(active?.tagName ?? "");
    }

    expect(seen).toEqual(new Set([behind, front]));
    expect(collapsedAt).toEqual([]);
  });

  it("leaves the stack as it is when focus arrives without the keyboard", async () => {
    render(<Toaster />);
    toast.error("First failure");
    toast.error("Second failure");
    const behind = await findToast("First failure");
    await waitFor(() => expect(behind).toHaveAttribute("data-front", "false"));
    const user = userEvent.setup();
    await user.tab();
    fireEvent.pointerDown(document.body);

    act(() => behind.focus());

    expect(behind).toHaveFocus();
    expect(behind).toHaveAttribute("data-expanded", "false");
  });

  it("keeps an accessible close control", async () => {
    render(<Toaster />);
    toast.success("Done");

    const toastNode = await findToast("Done");
    await waitFor(() => {
      expect(within(toastNode).getByRole("button", { name: /close/i })).toBeInTheDocument();
    });
  });
});
