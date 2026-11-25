import { describe, it, expect, vi } from "vitest";

import { render } from "@test/test-utils";

vi.mock("@utils/formatters", () => ({
  formatRelativeTime: (date: Date) => `relative:${date.toISOString()}`,
}));

vi.mock("@components/TrackStatusIndicator", () => ({
  TrackStatusIndicator: ({ status }: { status: string }) => <span>status:{status}</span>,
}));

import { LibraryStatusCell } from "../LibraryStatusCell";

describe("LibraryStatusCell", () => {
  it("shows the status with the time it was requested under it", () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const { getByText } = render(<LibraryStatusCell status="complete" createdAt={createdAt} />);

    expect(getByText("status:complete")).toBeInTheDocument();
    expect(getByText("relative:2024-01-01T00:00:00.000Z")).toBeInTheDocument();
  });
});
