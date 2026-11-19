import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("../LibraryPathsCard", () => ({
  LibraryPathsCard: () => <section data-testid="library-paths" />,
}));

vi.mock("../LibraryRulesCard", () => ({
  LibraryRulesCard: () => <section data-testid="library-rules" />,
}));

vi.mock("../LibraryScanCard", () => ({
  LibraryScanCard: () => <section data-testid="library-scan" />,
}));

vi.mock("../EditionsCard", () => ({
  EditionsCard: () => <section data-testid="editions" />,
}));

vi.mock("../AudioAnalysisCard", () => ({
  AudioAnalysisCard: () => <section data-testid="audio-analysis" />,
}));

vi.mock("../CoverArtCard", () => ({
  CoverArtCard: () => <section data-testid="cover-art" />,
}));

import { LibraryScanSection } from "../LibraryScanSection";
import { LibrarySection } from "../LibrarySection";

afterEach(() => {
  cleanup();
});

function sectionIds(): string[] {
  return screen
    .getAllByTestId(/.+/)
    .map((element) => element.getAttribute("data-testid"))
    .filter((id) => id !== null);
}

describe("LibrarySection", () => {
  it("shows the library paths and then the rules, and nothing else", () => {
    render(<LibrarySection />);

    expect(sectionIds()).toEqual(["library-paths", "library-rules"]);
  });

  it("leaves the page heading to the library tabs", () => {
    render(<LibrarySection />);

    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });
});

describe("LibraryScanSection", () => {
  it("shows the scan first, then audio analysis, cover art and album editions", () => {
    render(<LibraryScanSection />);

    expect(sectionIds()).toEqual(["library-scan", "audio-analysis", "cover-art", "editions"]);
  });

  it("leaves the page heading to the library tabs", () => {
    render(<LibraryScanSection />);

    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });
});
