import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { CategoryCard } from "../CategoryCard";

interface GenreItem {
  id: string;
  name: string;
}

const createGenre = (overrides: Partial<GenreItem> = {}): GenreItem => ({
  id: "test-genre",
  name: "Test Genre",
  ...overrides,
});

describe("CategoryCard", () => {
  it("renders category name", () => {
    render(<CategoryCard category={createGenre({ name: "Rock" })} />);

    expect(screen.getByText("Rock")).toBeInTheDocument();
  });

  it("calls onClick with category id and name when clicked", () => {
    const onClick = vi.fn();
    render(<CategoryCard category={createGenre({ id: "rock", name: "Rock" })} onClick={onClick} />);

    fireEvent.click(screen.getByText("Rock"));

    expect(onClick).toHaveBeenCalledWith("rock", "Rock");
  });

  it("does not throw when clicked without onClick handler", () => {
    render(<CategoryCard category={createGenre()} />);

    expect(() => fireEvent.click(screen.getByText("Test Genre"))).not.toThrow();
  });

  it("applies small size classes by default", () => {
    const { container } = render(<CategoryCard category={createGenre()} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("row-span-1");
  });

  it("applies medium size classes", () => {
    const { container } = render(<CategoryCard category={createGenre()} size="medium" />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("row-span-2");
  });

  it("applies large size classes", () => {
    const { container } = render(<CategoryCard category={createGenre()} size="large" />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("row-span-2");
    expect(card).toHaveClass("sm:col-span-2");
  });

  it("has cursor-pointer class for clickability", () => {
    const { container } = render(<CategoryCard category={createGenre()} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("cursor-pointer");
  });

  it("has hover transition classes", () => {
    const { container } = render(<CategoryCard category={createGenre()} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("transition-transform");
  });
});
