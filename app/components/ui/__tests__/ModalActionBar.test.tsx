import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ModalActionBar, ModalChoice } from "../ModalActionBar";
import { actionBar, actionBarButtons, actionBarEnd } from "../ModalActionBar/styles";

describe("ModalActionBar", () => {
  it("answers Cancel and Save, and keeps Save disabled while it says so", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSave = vi.fn();
    const { rerender } = render(
      <ModalActionBar
        cancel={{ label: "Cancel", onClick: onCancel }}
        save={{ label: "Save", onClick: onSave, disabled: true }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    rerender(
      <ModalActionBar cancel={{ label: "Cancel", onClick: onCancel }} save={{ label: "Save", onClick: onSave }} />
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("draws the start and the choice slots beside the actions", () => {
    render(
      <ModalActionBar
        start={<span>42 tracks</span>}
        choice={<ModalChoice label="Keep it" hint="Why" checked onChange={vi.fn()} />}
        cancel={{ label: "Cancel", onClick: vi.fn() }}
        save={{ label: "Save", onClick: vi.fn() }}
      />
    );

    expect(screen.getByText("42 tracks")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Keep it" })).toBeChecked();
    expect(screen.getByText("Keep it")).toHaveAttribute("title", "Why");
  });

  it("fits the modal width on a phone so Save is not clipped", () => {
    expect(actionBar()).toContain("min-w-0");
    expect(actionBar()).toContain("pb-[max(0.75rem,env(safe-area-inset-bottom))]");
    expect(actionBarEnd()).toContain("sm:ml-auto");
    expect(actionBarButtons()).toContain("min-w-0");
  });
});

describe("ModalChoice", () => {
  it("reports a change and locks while disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<ModalChoice label="Keep it" checked={false} onChange={onChange} />);

    await user.click(screen.getByRole("switch", { name: "Keep it" }));
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(<ModalChoice label="Keep it" checked={false} onChange={onChange} disabled />);
    expect(screen.getByRole("switch", { name: "Keep it" })).toBeDisabled();
  });
});
