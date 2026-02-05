import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { CategoryCard } from "../CategoryCard";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    onError,
    ...props
  }: {
    src: string;
    alt: string;
    onError?: () => void;
    [key: string]: unknown;
    // eslint-disable-next-line @next/next/no-img-element
  }) => <img src={src} alt={alt} data-testid="category-image" onError={onError} {...props} />,
}));

const createCategory = (overrides: Partial<SpotifyApi.CategoryObject> = {}): SpotifyApi.CategoryObject => ({
  id: "test-category",
  name: "Test Category",
  href: "https://api.spotify.com/v1/browse/categories/test-category",
  icons: [{ url: "https://example.com/image.jpg", height: 274, width: 274 }],
  ...overrides,
});

describe("CategoryCard", () => {
  it("renders category name", () => {
    render(<CategoryCard category={createCategory({ name: "Rock" })} />);

    expect(screen.getByText("Rock")).toBeInTheDocument();
  });

  it("renders category image when available", () => {
    render(<CategoryCard category={createCategory()} />);

    const img = screen.getByTestId("category-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("calls onClick with category id and name when clicked", () => {
    const onClick = vi.fn();
    render(<CategoryCard category={createCategory({ id: "rock", name: "Rock" })} onClick={onClick} />);

    fireEvent.click(screen.getByText("Rock"));

    expect(onClick).toHaveBeenCalledWith("rock", "Rock");
  });

  it("does not throw when clicked without onClick handler", () => {
    render(<CategoryCard category={createCategory()} />);

    expect(() => fireEvent.click(screen.getByText("Test Category"))).not.toThrow();
  });

  it("applies small size classes by default", () => {
    const { container } = render(<CategoryCard category={createCategory()} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("row-span-1");
  });

  it("applies medium size classes", () => {
    const { container } = render(<CategoryCard category={createCategory()} size="medium" />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("row-span-2");
  });

  it("applies large size classes", () => {
    const { container } = render(<CategoryCard category={createCategory()} size="large" />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("row-span-2");
    expect(card).toHaveClass("sm:col-span-2");
  });

  it("renders placeholder when no image available", () => {
    render(<CategoryCard category={createCategory({ icons: [] })} />);

    expect(screen.queryByTestId("category-image")).not.toBeInTheDocument();
  });

  it("has cursor-pointer class for clickability", () => {
    const { container } = render(<CategoryCard category={createCategory()} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("cursor-pointer");
  });

  it("has hover transition classes", () => {
    const { container } = render(<CategoryCard category={createCategory()} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("transition-transform");
  });

  it("shows placeholder when image fails to load", () => {
    render(<CategoryCard category={createCategory()} />);

    const img = screen.getByTestId("category-image");
    fireEvent.error(img);

    expect(screen.queryByTestId("category-image")).not.toBeInTheDocument();
  });
});
