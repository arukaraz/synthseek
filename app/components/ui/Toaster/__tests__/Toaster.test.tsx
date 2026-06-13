import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { toast } from "sonner";

import { Toaster } from "../Toaster";

afterEach(() => {
  toast.dismiss();
});

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

  it("keeps an accessible close control", async () => {
    render(<Toaster />);
    toast.success("Done");

    const toastNode = await findToast("Done");
    await waitFor(() => {
      expect(within(toastNode).getByRole("button", { name: /close/i })).toBeInTheDocument();
    });
  });
});
