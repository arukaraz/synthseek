import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Avatar } from "../Avatar";

describe("Avatar", () => {
  it("renders children content", () => {
    render(<Avatar>AB</Avatar>);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("renders with default md size", () => {
    render(<Avatar data-testid="avatar">Test</Avatar>);
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveClass("h-9", "w-9");
  });

  it("renders with sm size", () => {
    render(
      <Avatar size="sm" data-testid="avatar">
        S
      </Avatar>
    );
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveClass("h-8", "w-8");
  });

  it("renders with lg size", () => {
    render(
      <Avatar size="lg" data-testid="avatar">
        L
      </Avatar>
    );
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveClass("h-11", "w-11");
  });

  it("applies custom className", () => {
    render(
      <Avatar className="custom-class" data-testid="avatar">
        Test
      </Avatar>
    );
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveClass("custom-class");
  });

  it("forwards ref correctly", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Avatar ref={ref}>Ref</Avatar>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("spreads additional HTML attributes", () => {
    render(
      <Avatar data-testid="test-avatar" role="img">
        Test
      </Avatar>
    );
    expect(screen.getByTestId("test-avatar")).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("has gradient border styling", () => {
    render(<Avatar data-testid="avatar">Test</Avatar>);
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveClass("bg-gradient-to-br", "rounded-full");
  });
});
