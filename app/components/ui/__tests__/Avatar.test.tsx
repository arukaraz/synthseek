import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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
    expect(avatar).toHaveClass("bg-linear-to-br", "rounded-full");
  });

  it("renders the uppercased first initial when given a username and no image", () => {
    render(<Avatar username="alice" data-testid="avatar" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders an image when given an imageUrl", () => {
    render(<Avatar imageUrl="https://example.com/a.png" username="alice" data-testid="avatar" />);
    const avatar = screen.getByTestId("avatar");
    const img = avatar.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("falls back to the initial when the image fails to load", () => {
    render(<Avatar imageUrl="https://example.com/broken.png" username="bob" data-testid="avatar" />);
    const avatar = screen.getByTestId("avatar");
    const img = avatar.querySelector("img");
    expect(img).not.toBeNull();
    if (img) fireEvent.error(img);
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
