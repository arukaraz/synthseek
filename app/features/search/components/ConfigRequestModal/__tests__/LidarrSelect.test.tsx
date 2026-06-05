import { describe, expect, it, vi, afterEach } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LidarrSelect } from "../LidarrSelect";

const OPTIONS = [
  { value: "/music", label: "/music", description: "50 GB free" },
  { value: "/archive", label: "/archive" },
];

describe("LidarrSelect", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the placeholder when no value is selected", () => {
    render(
      <LidarrSelect
        label="Root folder"
        placeholder="Choose a folder"
        options={OPTIONS}
        value={undefined}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Root folder")).toBeInTheDocument();
    expect(screen.getByText("Choose a folder")).toBeInTheDocument();
  });

  it("shows the active option label and description", () => {
    render(
      <LidarrSelect
        label="Root folder"
        placeholder="Choose a folder"
        options={OPTIONS}
        value="/music"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("/music")).toBeInTheDocument();
    expect(screen.getByText("50 GB free")).toBeInTheDocument();
  });

  it("omits the description when the active option has none", () => {
    render(
      <LidarrSelect
        label="Root folder"
        placeholder="Choose a folder"
        options={OPTIONS}
        value="/archive"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("/archive")).toBeInTheDocument();
    expect(screen.queryByText("50 GB free")).not.toBeInTheDocument();
  });

  it("disables the trigger when disabled", () => {
    render(
      <LidarrSelect
        label="Root folder"
        placeholder="Choose a folder"
        options={OPTIONS}
        value="/music"
        onChange={vi.fn()}
        disabled
      />
    );

    expect(screen.getByRole("button", { name: "Root folder" })).toBeDisabled();
  });

  it("opens the menu and selects an option", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <LidarrSelect
        label="Root folder"
        placeholder="Choose a folder"
        options={OPTIONS}
        value={undefined}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: "Root folder" }));

    const items = await screen.findAllByRole("menuitemradio");
    expect(items).toHaveLength(OPTIONS.length);

    await user.click(items[0]);

    expect(onChange).toHaveBeenCalledWith("/music");
  });

  it("renders each option description inside the open menu", async () => {
    const user = userEvent.setup();
    render(
      <LidarrSelect
        label="Root folder"
        placeholder="Choose a folder"
        options={OPTIONS}
        value="/music"
        onChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Root folder" }));

    const descriptions = await screen.findAllByText("50 GB free");
    expect(descriptions.length).toBeGreaterThan(0);
  });
});
