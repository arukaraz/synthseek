import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogSurface, DialogTitle } from "../Dialog";

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

describe("DialogHeader", () => {
  function headerOf(showClose: boolean): HTMLElement {
    render(
      <Dialog open>
        <DialogContent showClose={showClose}>
          <DialogHeader data-testid="header">
            <DialogTitle>Reject the 3 copies of a song with a long title</DialogTitle>
          </DialogHeader>
          <DialogDescription>Files</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    return screen.getByTestId("header");
  }

  it("keeps the title clear of the close button when the dialog shows one", () => {
    expect(headerOf(true).className).toContain("sm:pr-8");
  });

  it("gives the title the whole width when the dialog has no close button", () => {
    expect(headerOf(false).className).not.toMatch(/\bp[rx]-8\b/);
  });
});

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

describe("one blur under an open dialog", () => {
  it.each([
    [
      "content",
      <DialogContent key="content">
        <DialogTitle>Title</DialogTitle>
      </DialogContent>,
    ],
    [
      "surface",
      <DialogSurface key="surface">
        <DialogTitle>Title</DialogTitle>
      </DialogSurface>,
    ],
  ])("keeps every layer inside the dialog %s from blurring again over the veil", (_, body) => {
    render(<Dialog open>{body}</Dialog>);

    expect(screen.getByRole("dialog").className).toContain("[&_*]:[backdrop-filter:none]");
  });

  it("opens a popover over the dialog without a blur of its own", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <Popover open>
            <PopoverTrigger>Info</PopoverTrigger>
            <PopoverContent>Details</PopoverContent>
          </Popover>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Details").className).not.toMatch(/backdrop-blur/);
  });
});
