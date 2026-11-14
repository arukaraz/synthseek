import { describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen } from "@test/test-utils";

import { RequestFooter } from "../RequestFooter";

describe("RequestFooter", () => {
  it("shows the summary, the note and the action", () => {
    renderWithProviders(
      <RequestFooter summary="FLAC first" note="Same as a direct request">
        <button type="button">Request</button>
      </RequestFooter>
    );

    expect(screen.getByText("FLAC first")).toBeInTheDocument();
    expect(screen.getByText("Same as a direct request")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request" })).toBeInTheDocument();
  });

  it("offers no keep requesting choice when the caller passes none", () => {
    renderWithProviders(
      <RequestFooter summary={null} note={null}>
        <button type="button">Request</button>
      </RequestFooter>
    );

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("reflects the keep requesting choice and reports a change", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <RequestFooter summary={null} note={null} keepRequesting={{ checked: false, onChange }}>
        <button type="button">Request</button>
      </RequestFooter>
    );

    const checkbox = screen.getByRole("checkbox", { name: "Keep requesting" });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("shows the choice as on when the caller says so", () => {
    renderWithProviders(
      <RequestFooter summary={null} note={null} keepRequesting={{ checked: true, onChange: vi.fn() }}>
        <button type="button">Request</button>
      </RequestFooter>
    );

    expect(screen.getByRole("checkbox", { name: "Keep requesting" })).toBeChecked();
  });
});
