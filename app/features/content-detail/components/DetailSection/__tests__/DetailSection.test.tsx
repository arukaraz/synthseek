import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DetailSection } from "../DetailSection";

describe("DetailSection", () => {
  it("shows its content once loaded", () => {
    render(
      <DetailSection title="Tracklist" isLoading={false}>
        <p>the tracks</p>
      </DetailSection>
    );

    expect(screen.getByText("the tracks")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("says what went wrong instead of its content, even while it still counts as loading", () => {
    render(
      <DetailSection title="Tracklist" isLoading errorMessage="This could not be loaded.">
        <p>the tracks</p>
      </DetailSection>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("This could not be loaded.");
    expect(screen.getByRole("heading", { name: "Tracklist" })).toBeInTheDocument();
    expect(screen.queryByText("the tracks")).not.toBeInTheDocument();
  });
});
