import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@test/test-utils";
import { CardHeader } from "../CardHeader";
import { RequestStatus } from "@api/__generated__/types";
import { Clock } from "lucide-react";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-testid="card-image" {...props} />
  ),
}));

vi.mock("@components/ui/ImageGlow/ImageGlow", () => ({
  ImageGlow: () => <div data-testid="image-glow" />,
}));

describe("CardHeader", () => {
  const defaultProps = {
    title: "Test Track",
    subtitle: "Test Artist",
    status: RequestStatus.enum.queued,
  };

  it("renders title", () => {
    render(<CardHeader {...defaultProps} />);

    expect(screen.getByText("Test Track")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<CardHeader {...defaultProps} />);

    expect(screen.getByText("Test Artist")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<CardHeader {...defaultProps} />);

    expect(screen.getByText("Queued")).toBeInTheDocument();
  });

  it("renders image when imageUrl is provided", () => {
    render(<CardHeader {...defaultProps} imageUrl="https://example.com/image.jpg" />);

    const img = screen.getByTestId("card-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("renders placeholder when no imageUrl", () => {
    render(<CardHeader {...defaultProps} />);

    expect(screen.queryByTestId("card-image")).not.toBeInTheDocument();
  });

  it("shows image glow when showGlow is true", () => {
    render(<CardHeader {...defaultProps} imageUrl="https://example.com/image.jpg" showGlow />);

    expect(screen.getByTestId("image-glow")).toBeInTheDocument();
  });

  it("hides image glow when showGlow is false", () => {
    render(<CardHeader {...defaultProps} imageUrl="https://example.com/image.jpg" showGlow={false} />);

    expect(screen.queryByTestId("image-glow")).not.toBeInTheDocument();
  });

  it("renders music badge when showMusicBadge is true", () => {
    const { container } = render(<CardHeader {...defaultProps} showMusicBadge />);

    const musicBadge = container.querySelector(".absolute");
    expect(musicBadge).toBeInTheDocument();
  });

  it("applies sm size config by default", () => {
    const { container } = render(<CardHeader {...defaultProps} imageUrl="https://example.com/image.jpg" />);

    const imageContainer = container.querySelector(".h-14.w-14");
    expect(imageContainer).toBeInTheDocument();
  });

  it("applies md size config", () => {
    const { container } = render(<CardHeader {...defaultProps} size="md" imageUrl="https://example.com/image.jpg" />);

    const imageContainer = container.querySelector(".h-16.w-16");
    expect(imageContainer).toBeInTheDocument();
  });

  it("uses custom icon for placeholder", () => {
    render(<CardHeader {...defaultProps} icon={Clock} />);

    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("applies data-cy attributes", () => {
    const { container } = render(<CardHeader {...defaultProps} dataCyPrefix="album" />);

    const titleEl = container.querySelector('[data-cy="album-title"]');
    expect(titleEl).toBeInTheDocument();
    expect(titleEl).toHaveTextContent("Test Track");
  });
});
