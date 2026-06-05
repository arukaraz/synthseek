import { describe, it, expect } from "vitest";

import { render, screen } from "@test/test-utils";

import { LibraryLoader } from "../LibraryLoader";

describe("LibraryLoader", () => {
  it("renders a polite live status region", () => {
    render(<LibraryLoader />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-busy", "true");
  });

  it("renders the library loading label from the app shell namespace", () => {
    render(<LibraryLoader />);

    expect(screen.getByText("Loading your library")).toBeInTheDocument();
  });
});
