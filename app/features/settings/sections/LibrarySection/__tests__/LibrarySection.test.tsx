import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("../LibraryPathsCard", () => ({
  LibraryPathsCard: () => <section data-testid="library-paths" />,
}));

vi.mock("../LibraryRulesCard", () => ({
  LibraryRulesCard: () => <section data-testid="library-rules" />,
}));

vi.mock("../AudioAnalysisCard", () => ({
  AudioAnalysisCard: () => <section data-testid="audio-analysis" />,
}));

import { LibrarySection } from "../LibrarySection";

afterEach(() => {
  cleanup();
});

describe("LibrarySection", () => {
  it("shows the library paths and then the rules", () => {
    render(<LibrarySection />);

    const paths = screen.getByTestId("library-paths");
    const rules = screen.getByTestId("library-rules");
    expect(paths.compareDocumentPosition(rules) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("leaves the page heading to the library tabs", () => {
    render(<LibrarySection />);

    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });
});
