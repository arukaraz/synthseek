import { render, screen } from "@testing-library/react";
import { Calendar, List } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "../SegmentedControl";

const OPTIONS = [
  { value: "month", label: "Month", icon: Calendar },
  { value: "list", label: "List", icon: List },
] as const;

describe("SegmentedControl", () => {
  it("keeps every label visible by default", () => {
    render(<SegmentedControl value="month" options={OPTIONS} onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "Month" })).toHaveTextContent("Month");
    expect(screen.getByText("Month")).not.toHaveClass("max-sm:sr-only");
  });

  it("hides the labels only on a phone while keeping them as the accessible names", () => {
    render(<SegmentedControl value="month" options={OPTIONS} onChange={vi.fn()} glyphOnlyOnPhone />);

    expect(screen.getByRole("radio", { name: "Month" })).toBeInTheDocument();
    expect(screen.getByText("Month")).toHaveClass("max-sm:sr-only");
    expect(screen.getByText("List")).toHaveClass("max-sm:sr-only");
  });
});
