import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RejectApprovalDialog } from "../RejectApprovalDialog";

const accessibility = vi.hoisted(() => ({ mode: false }));

vi.mock("@modules/providers/AccessibilityProvider", () => ({
  useAccessibility: () => ({ mode: accessibility.mode }),
}));

type DialogProps = React.ComponentProps<typeof RejectApprovalDialog>;

function dialog(overrides: Partial<DialogProps> = {}): React.ReactElement {
  return (
    <RejectApprovalDialog
      open
      onOpenChange={vi.fn()}
      count={2}
      error={null}
      pending={false}
      onConfirm={vi.fn()}
      {...overrides}
    />
  );
}

afterEach(() => {
  accessibility.mode = false;
});

describe("RejectApprovalDialog with the accessibility mode off", () => {
  it("hands over the reason and closes at once, as it always did", async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(dialog({ onConfirm, onOpenChange }));

    await userEvent.type(screen.getByLabelText("Reason (optional)"), "  Wrong album  ");
    await userEvent.click(screen.getByRole("button", { name: "Reject 2 tracks" }));

    expect(onConfirm).toHaveBeenCalledWith("Wrong album");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes at once even when the request then fails, because the toast carries it", async () => {
    const onOpenChange = vi.fn();
    render(dialog({ onOpenChange, error: new Error("It broke") }));

    await userEvent.click(screen.getByRole("button", { name: "Reject 2 tracks" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("RejectApprovalDialog with the accessibility mode on", () => {
  it("stays open while the request runs and closes when it succeeds", async () => {
    accessibility.mode = true;
    const onOpenChange = vi.fn();
    const { rerender } = render(dialog({ onOpenChange }));

    await userEvent.click(screen.getByRole("button", { name: "Reject 2 tracks" }));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Reject 2 tracks" })).toBeDisabled();

    rerender(dialog({ onOpenChange, pending: true }));
    expect(onOpenChange).not.toHaveBeenCalled();

    rerender(dialog({ onOpenChange, pending: false }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays open and says what went wrong when the request fails", async () => {
    accessibility.mode = true;
    const onOpenChange = vi.fn();
    const { rerender } = render(dialog({ onOpenChange }));

    await userEvent.click(screen.getByRole("button", { name: "Reject 2 tracks" }));
    rerender(dialog({ onOpenChange, pending: true }));
    rerender(dialog({ onOpenChange, pending: false, error: new Error("The server said no") }));

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByText("The server said no", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject 2 tracks" })).toBeEnabled();
  });

  it("does not show an error left over from an earlier attempt", () => {
    accessibility.mode = true;
    render(dialog({ error: new Error("Old failure") }));

    expect(screen.queryByText("Old failure")).not.toBeInTheDocument();
  });
});
