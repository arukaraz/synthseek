import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@test/test-utils";
import userEvent from "@testing-library/user-event";
import { SortDropdown } from "../SortDropdown";
import { SortField } from "../../../types";

describe("SortDropdown", () => {
  const defaultProps = {
    value: SortField.RECENT,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger button with current sort label", () => {
    render(<SortDropdown {...defaultProps} value={SortField.RECENT} />);

    expect(screen.getByText("Recent")).toBeInTheDocument();
  });

  it("shows Artist label when value is artist", () => {
    render(<SortDropdown {...defaultProps} value={SortField.ARTIST} />);

    expect(screen.getByText("Artist")).toBeInTheDocument();
  });

  it("shows Album label when value is album", () => {
    render(<SortDropdown {...defaultProps} value={SortField.ALBUM} />);

    expect(screen.getByText("Album")).toBeInTheDocument();
  });

  it("opens dropdown menu when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<SortDropdown {...defaultProps} />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);

    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("displays all sort options in dropdown", async () => {
    const user = userEvent.setup();
    render(<SortDropdown {...defaultProps} />);

    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("menuitemradio", { name: /recent/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /artist/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /album/i })).toBeInTheDocument();
  });

  it("calls onChange with selected sort field", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortDropdown {...defaultProps} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    await screen.findByRole("menu");
    await user.click(screen.getByRole("menuitemradio", { name: /artist/i }));

    expect(onChange).toHaveBeenCalledWith(SortField.ARTIST);
  });

  it("marks current value as checked in radio group", async () => {
    const user = userEvent.setup();
    render(<SortDropdown {...defaultProps} value={SortField.ALBUM} />);

    await user.click(screen.getByRole("button"));
    const albumOption = await screen.findByRole("menuitemradio", { name: /album/i });

    expect(albumOption).toHaveAttribute("aria-checked", "true");
  });
});
