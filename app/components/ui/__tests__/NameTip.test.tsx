import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Trash2 } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Button } from "../Button";
import { IconButton } from "../IconButton";

const accessibility = vi.hoisted(() => ({ mode: false }));

vi.mock("@modules/providers/AccessibilityProvider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@modules/providers/AccessibilityProvider")>();
  return { ...actual, useAccessibility: () => ({ ...actual.useAccessibility(), mode: accessibility.mode }) };
});

beforeEach(() => {
  accessibility.mode = false;
});

describe("button names on hover", () => {
  it("shows no tooltip of its own with the mode off, so the page is as it was", async () => {
    const user = userEvent.setup();
    render(<IconButton icon={Trash2} aria-label="Delete track" />);

    await user.tab();

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows the name in the app's tooltip when an icon button is reached with the mode on", async () => {
    accessibility.mode = true;
    const user = userEvent.setup();
    render(<IconButton icon={Trash2} aria-label="Delete track" />);

    await user.tab();

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Delete track");
  });

  it("does the same for the icon size of the shared Button", async () => {
    accessibility.mode = true;
    const user = userEvent.setup();
    render(
      <Button size="icon" aria-label="Open menu">
        <Trash2 />
      </Button>
    );

    await user.tab();

    expect(await screen.findByRole("tooltip")).toHaveTextContent("Open menu");
  });

  it("leaves a text button alone even with the mode on", async () => {
    accessibility.mode = true;
    const user = userEvent.setup();
    render(<Button aria-label="Save">Save</Button>);

    await user.tab();

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
