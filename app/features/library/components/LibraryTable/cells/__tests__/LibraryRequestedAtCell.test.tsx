import { describe, it, expect, vi } from "vitest";

import { render } from "@test/test-utils";

vi.mock("@utils/formatters", () => ({
  formatRelativeTime: (date: Date) => `relative:${date.toISOString()}`,
}));

import { LibraryRequestedAtCell } from "../LibraryRequestedAtCell";

describe("LibraryRequestedAtCell", () => {
  it("formats the created-at date as a relative time string", () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const { getByText } = render(<LibraryRequestedAtCell createdAt={createdAt} />);

    expect(getByText("relative:2024-01-01T00:00:00.000Z")).toBeInTheDocument();
  });
});
