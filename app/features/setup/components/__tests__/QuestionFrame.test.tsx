import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuestionFrame } from "../QuestionFrame";

vi.mock("@components/AccessibilityPanel", () => ({
  AccessibilityPanel: () => <button type="button">Accessibility</button>,
}));

describe("QuestionFrame", () => {
  it("names the question in the eyebrow and says where the visitor is as text", () => {
    render(
      <QuestionFrame step="downloads" focusKey="downloads" title="How?">
        <p>body</p>
      </QuestionFrame>
    );

    expect(screen.getByText("3 · New music")).toBeInTheDocument();
    expect(screen.getByText("Question 3 of 4")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("shows the description only when there is one", () => {
    const { rerender } = render(
      <QuestionFrame step="media" focusKey="media" title="Where?" description="Pick one.">
        <p>body</p>
      </QuestionFrame>
    );
    expect(screen.getByText("Pick one.")).toBeInTheDocument();

    rerender(
      <QuestionFrame step="media" focusKey="media" title="Where?">
        <p>body</p>
      </QuestionFrame>
    );

    expect(screen.queryByText("Pick one.")).not.toBeInTheDocument();
  });

  it("reads the summary as ready and not as a numbered question", () => {
    render(
      <QuestionFrame step="summary" focusKey="summary" title="Done">
        <p>body</p>
      </QuestionFrame>
    );

    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("All 4 questions done, ready to finish")).toBeInTheDocument();
  });

  it("fills the thin track by how far along the question is", () => {
    const { container } = render(
      <QuestionFrame step="media" focusKey="media" title="Where?">
        <p>body</p>
      </QuestionFrame>
    );

    expect(container.querySelector("[style]")).toHaveStyle({ width: "50%" });
  });

  it("puts the cursor on the heading when it appears and again when the question changes", () => {
    const { rerender } = render(
      <QuestionFrame step="media" focusKey="media" title="Where?">
        <button type="button">inside</button>
      </QuestionFrame>
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveFocus();

    screen.getByRole("button", { name: "inside" }).focus();
    rerender(
      <QuestionFrame step="media" focusKey="media" title="Where?">
        <button type="button">inside</button>
      </QuestionFrame>
    );
    expect(screen.getByRole("button", { name: "inside" })).toHaveFocus();

    rerender(
      <QuestionFrame step="media" focusKey="media-plex" title="Connect Plex.">
        <button type="button">inside</button>
      </QuestionFrame>
    );

    expect(screen.getByRole("heading", { level: 1, name: "Connect Plex." })).toHaveFocus();
  });

  it("offers the accessibility control on every question", () => {
    render(
      <QuestionFrame step="metadata" focusKey="metadata" title="Email">
        <p>body</p>
      </QuestionFrame>
    );

    expect(screen.getByRole("button", { name: "Accessibility" })).toBeInTheDocument();
  });
});
