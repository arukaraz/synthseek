import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode, useState } from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
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

describe("focus when a dialog with no trigger closes", () => {
  function OpenedByState({ body }: { body: (close: () => void) => ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Open it
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          {body(() => setOpen(false))}
        </Dialog>
      </>
    );
  }

  async function openAndClose(): Promise<HTMLElement> {
    const opener = screen.getByRole("button", { name: "Open it" });
    opener.focus();
    fireEvent.click(opener);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    return opener;
  }

  it.each([
    [
      "content",
      <DialogContent key="content">
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Body</DialogDescription>
      </DialogContent>,
    ],
    [
      "surface",
      <DialogSurface key="surface">
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Body</DialogDescription>
        <button type="button">Inside</button>
      </DialogSurface>,
    ],
  ])("puts focus back on the control that opened the dialog %s", async (_, body) => {
    render(<OpenedByState body={() => body} />);

    const opener = await openAndClose();

    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("leaves focus to a dialog that places it itself on close", async () => {
    render(
      <>
        <button type="button">Somewhere else</button>
        <OpenedByState
          body={() => (
            <DialogContent
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                screen.getByRole("button", { name: "Somewhere else" }).focus();
              }}
            >
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Body</DialogDescription>
            </DialogContent>
          )}
        />
      </>
    );

    await openAndClose();

    await waitFor(() => expect(screen.getByRole("button", { name: "Somewhere else" })).toHaveFocus());
  });

  it("puts focus back on the button of the menu whose item opened the dialog", async () => {
    function OpenedFromMenu() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>Row actions</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setOpen(true)}>Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Body</DialogDescription>
            </DialogContent>
          </Dialog>
        </>
      );
    }
    render(<OpenedFromMenu />);
    const trigger = screen.getByRole("button", { name: "Row actions" });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });
    const item = await screen.findByRole("menuitem", { name: "Edit" });
    item.focus();
    fireEvent.keyDown(item, { key: "Enter" });
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await waitFor(() => expect(screen.getByRole("button", { name: "Row actions" })).toHaveFocus());
  });

  it("still runs what the dialog asked for when it opens", async () => {
    const onOpenAutoFocus = vi.fn();
    render(
      <OpenedByState
        body={() => (
          <DialogContent onOpenAutoFocus={onOpenAutoFocus}>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Body</DialogDescription>
          </DialogContent>
        )}
      />
    );

    const opener = await openAndClose();

    expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(opener).toHaveFocus());
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
            <PopoverContent aria-label="Info details">Details</PopoverContent>
          </Popover>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Details").className).not.toMatch(/backdrop-blur/);
  });
});
