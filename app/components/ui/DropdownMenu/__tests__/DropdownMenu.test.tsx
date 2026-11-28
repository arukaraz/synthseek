import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { motion } from "framer-motion";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../DropdownMenu";

afterEach(() => {
  cleanup();
});

function pressEnter(trigger: HTMLElement): void {
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
  fireEvent.keyUp(trigger, { key: "Enter" });
}

describe("DropdownMenuTrigger", () => {
  it("opens with Enter when its button animates on press", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button type="button" whileTap={{ scale: 0.98 }}>
            Import
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>From a file</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    pressEnter(screen.getByRole("button", { name: "Import" }));

    expect(await screen.findByRole("menuitem", { name: "From a file" })).toBeInTheDocument();
  });

  it("opens with Enter on a plain button", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Sort</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Newest</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    pressEnter(screen.getByRole("button", { name: "Sort" }));

    expect(await screen.findByRole("menuitem", { name: "Newest" })).toBeInTheDocument();
  });

  it("still opens when a mouse presses it", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Sort</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Newest</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: "Sort" }), { button: 0, pointerType: "mouse" });

    expect(await screen.findByRole("menuitem", { name: "Newest" })).toBeInTheDocument();
  });
});
