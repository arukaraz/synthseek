import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfirmationModal } from "../ConfirmationModal";

const DEFAULT_CONFIRM_TEXT = "Confirm";
const DEFAULT_CANCEL_TEXT = "Cancel";

const baseProps = {
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: "Delete request",
  message: "This action cannot be undone.",
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("ConfirmationModal", () => {
  it("does not render any dialog content when closed", () => {
    render(<ConfirmationModal {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete request")).not.toBeInTheDocument();
  });

  it("renders the title and message inside a dialog when open", () => {
    render(<ConfirmationModal {...baseProps} isOpen />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Delete request")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("associates the dialog with its title and description for assistive tech", () => {
    render(<ConfirmationModal {...baseProps} isOpen />);
    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    const describedBy = dialog.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy ?? "")).toHaveTextContent("Delete request");
    expect(document.getElementById(describedBy ?? "")).toHaveTextContent("This action cannot be undone.");
  });

  it("uses the default confirm and cancel labels", () => {
    render(<ConfirmationModal {...baseProps} isOpen />);
    expect(screen.getByRole("button", { name: DEFAULT_CONFIRM_TEXT })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: DEFAULT_CANCEL_TEXT })).toBeInTheDocument();
  });

  it("honors custom confirm and cancel labels", () => {
    render(<ConfirmationModal {...baseProps} isOpen confirmText="Remove" cancelText="Keep" />);
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
  });

  it("calls onConfirm then onClose when the confirm action is clicked", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...baseProps} isOpen onConfirm={onConfirm} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: DEFAULT_CONFIRM_TEXT }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls only onClose when the cancel action is clicked", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...baseProps} isOpen onConfirm={onConfirm} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: DEFAULT_CANCEL_TEXT }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("closes via the Escape key without confirming", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...baseProps} isOpen onConfirm={onConfirm} onClose={onClose} />);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("hides the cancel action when showCancel is false", () => {
    render(<ConfirmationModal {...baseProps} isOpen showCancel={false} />);
    expect(screen.queryByRole("button", { name: DEFAULT_CANCEL_TEXT })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: DEFAULT_CONFIRM_TEXT })).toBeInTheDocument();
  });

  it("places initial focus on the safe cancel action", async () => {
    render(<ConfirmationModal {...baseProps} isOpen />);
    await waitFor(() => expect(screen.getByRole("button", { name: DEFAULT_CANCEL_TEXT })).toHaveFocus());
  });

  it("places initial focus on the confirm action when there is no cancel", async () => {
    render(<ConfirmationModal {...baseProps} isOpen showCancel={false} />);
    await waitFor(() => expect(screen.getByRole("button", { name: DEFAULT_CONFIRM_TEXT })).toHaveFocus());
  });

  it("maps the danger variant confirm action to the error status token", () => {
    render(<ConfirmationModal {...baseProps} isOpen variant="danger" />);
    const confirm = screen.getByRole("button", { name: DEFAULT_CONFIRM_TEXT });
    expect(confirm.className).toContain("oklch(var(--neon-error)");
  });

  it("maps the warning variant confirm action to the warning status token", () => {
    render(<ConfirmationModal {...baseProps} isOpen variant="warning" />);
    const confirm = screen.getByRole("button", { name: DEFAULT_CONFIRM_TEXT });
    expect(confirm.className).toContain("oklch(var(--neon-warning)");
  });
});
