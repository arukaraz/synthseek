import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const spies = vi.hoisted(() => ({
  settings: { data: undefined as unknown },
  update: vi.fn(),
}));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => spies.settings,
}));

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEngineReview: () => ({ mutate: spies.update, isPending: false }),
}));

import { ReviewFooter } from "../components/ReviewFooter";

describe("ReviewFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.settings.data = { engine: { review: { retentionDays: 14 } } };
  });

  it("summarises the whole queue, not the rows on screen", () => {
    render(<ReviewFooter totalCount={312} totalBytes={12_582_912} />);

    expect(screen.getByText("312 held imports in total, 12.0 MB still on disk")).toBeInTheDocument();
  });

  it("uses the singular summary for a single held import", () => {
    render(<ReviewFooter totalCount={1} totalBytes={1024} />);

    expect(screen.getByText("1 held import in total, 1.0 KB still on disk")).toBeInTheDocument();
  });

  it("seeds the retention control from the stored setting and hides save until it changes", () => {
    render(<ReviewFooter totalCount={0} totalBytes={0} />);

    expect(screen.getByLabelText("Keep for")).toHaveValue(14);
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });

  it("saves the whole engine.review group with the edited retention", async () => {
    const user = userEvent.setup();
    render(<ReviewFooter totalCount={0} totalBytes={0} />);

    fireEvent.change(screen.getByLabelText("Keep for"), { target: { value: "30" } });
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(spies.update).toHaveBeenCalledWith({ retentionDays: 30 });
  });

  it("blocks a retention below the server minimum and names the accepted range", () => {
    render(<ReviewFooter totalCount={0} totalBytes={0} />);

    fireEvent.change(screen.getByLabelText("Keep for"), { target: { value: "0" } });

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a whole number of days between 1 and 365");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(spies.update).not.toHaveBeenCalled();
  });

  it("blocks a retention above the server maximum", () => {
    render(<ReviewFooter totalCount={0} totalBytes={0} />);

    fireEvent.change(screen.getByLabelText("Keep for"), { target: { value: "500" } });

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("keeps the cleared field empty instead of silently holding the stored number", () => {
    render(<ReviewFooter totalCount={0} totalBytes={0} />);

    const input = screen.getByLabelText("Keep for");
    fireEvent.change(input, { target: { value: "" } });

    expect(input).toHaveValue(null);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("re-enables save once the value is back inside the accepted range", () => {
    render(<ReviewFooter totalCount={0} totalBytes={0} />);

    const input = screen.getByLabelText("Keep for");
    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.change(input, { target: { value: "365" } });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("renders no retention control while the settings are still loading", () => {
    spies.settings.data = undefined;
    render(<ReviewFooter totalCount={0} totalBytes={0} />);

    expect(screen.queryByLabelText("Keep for")).not.toBeInTheDocument();
  });
});
