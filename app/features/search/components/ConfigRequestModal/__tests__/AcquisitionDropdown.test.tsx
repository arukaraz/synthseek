import { describe, expect, it, vi, afterEach } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AcquisitionDropdown } from "../AcquisitionDropdown";
import { ACQUISITION_METHOD_OPTIONS, LIDARR_ACQUISITION_OPTION } from "../consts";

describe("AcquisitionDropdown", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the label and the active option copy", () => {
    render(
      <AcquisitionDropdown label="Acquisition" value="auto" options={ACQUISITION_METHOD_OPTIONS} onChange={vi.fn()} />
    );

    expect(screen.getByText("Acquisition")).toBeInTheDocument();
    expect(screen.getByLabelText("Acquisition")).toBeInTheDocument();
  });

  it("falls back to the first option when the value is not present", () => {
    render(
      <AcquisitionDropdown label="Acquisition" value="lidarr" options={ACQUISITION_METHOD_OPTIONS} onChange={vi.fn()} />
    );

    expect(screen.getByLabelText("Acquisition")).toBeInTheDocument();
  });

  it("renders empty copy when no options are available", () => {
    render(<AcquisitionDropdown label="Acquisition" value="auto" options={[]} onChange={vi.fn()} />);

    expect(screen.getByLabelText("Acquisition")).toBeInTheDocument();
  });

  it("shows the lidarr option as the active selection when matched", () => {
    render(
      <AcquisitionDropdown
        label="Acquisition"
        value="lidarr"
        options={[...ACQUISITION_METHOD_OPTIONS, LIDARR_ACQUISITION_OPTION]}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Acquisition")).toBeInTheDocument();
  });

  it("opens the menu and selects a different method", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AcquisitionDropdown label="Acquisition" value="auto" options={ACQUISITION_METHOD_OPTIONS} onChange={onChange} />
    );

    await user.click(screen.getByLabelText("Acquisition"));

    const items = await screen.findAllByRole("menuitemradio");
    expect(items.length).toBe(ACQUISITION_METHOD_OPTIONS.length);

    const slskd = items.find((item) => item.textContent?.toLowerCase().includes("soulseek"));
    await user.click(slskd ?? items[1]);

    expect(onChange).toHaveBeenCalled();
  });
});
