import { describe, expect, it } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

import { FileFailureList } from "../FileFailureList";

describe("FileFailureList", () => {
  it("gives each failure a readable reason", () => {
    renderWithProviders(
      <FileFailureList
        failures={[
          { title: "Digital Love", reason: "NO_SPACE" },
          { title: "Veridis Quo", reason: "READ_ONLY" },
          { title: "Too Long", reason: "OCCUPIED" },
        ]}
        failedCount={3}
      />
    );

    expect(screen.getByText("Digital Love: not enough space")).toBeInTheDocument();
    expect(screen.getByText("Veridis Quo: its library path is read-only")).toBeInTheDocument();
    expect(screen.getByText("Too Long: another file already has its new name")).toBeInTheDocument();
  });

  it("lists the first few and counts the rest, including those the server did not sample", () => {
    const failures = Array.from({ length: 20 }, (_, index) => ({
      title: `Song ${index + 1}`,
      reason: "MOVE_FAILED" as const,
    }));
    renderWithProviders(<FileFailureList failures={failures} failedCount={42} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByText("and 37 more")).toBeInTheDocument();
  });
});
