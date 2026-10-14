import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { Dialog, DialogContent, DialogDescription, DialogSurface, DialogTitle } from "../Dialog";

afterEach(() => {
  cleanup();
});

function Toaster() {
  return (
    <ol data-sonner-toaster="">
      <li>
        <button type="button">Undo</button>
      </li>
    </ol>
  );
}

function Outside() {
  return <button type="button">Elsewhere</button>;
}

async function pressOutside(name: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  fireEvent.pointerDown(screen.getByRole("button", { name, hidden: true }));
}

describe("DialogContent", () => {
  it("stays open when a toast is pressed, so the toast's action can run", async () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <Toaster />
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Review</DialogTitle>
            <DialogDescription>Files</DialogDescription>
          </DialogContent>
        </Dialog>
      </>
    );

    await pressOutside("Undo");

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("still closes when anything else outside it is pressed", async () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <Outside />
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Review</DialogTitle>
            <DialogDescription>Files</DialogDescription>
          </DialogContent>
        </Dialog>
      </>
    );

    await pressOutside("Elsewhere");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("DialogSurface", () => {
  it("stays open when a toast is pressed", async () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <Toaster />
        <Dialog open onOpenChange={onOpenChange}>
          <DialogSurface>
            <DialogTitle>Review</DialogTitle>
            <DialogDescription>Files</DialogDescription>
          </DialogSurface>
        </Dialog>
      </>
    );

    await pressOutside("Undo");

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
