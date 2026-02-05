import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { Card } from "../Card";
import { ContentType } from "@api/__generated__/types";
import type { DisplayResult } from "../types";

vi.mock("next/image", () => ({
  default: ({ src, alt, onError, ...props }: { src: string; alt: string; onError?: () => void; [key: string]: unknown }) => (
    <img src={src} alt={alt} data-testid="result-image" onError={onError} {...props} />
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@components/ui/ConfirmationModal", () => ({
  ConfirmationModal: ({
    isOpen,
    title,
    message,
    onConfirm,
  }: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }) =>
    isOpen ? (
      <div data-testid="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>Got it</button>
      </div>
    ) : null,
}));

const createResult = (overrides: Partial<DisplayResult> = {}): DisplayResult => ({
  id: "test-id",
  type: ContentType.enum.track,
  name: "Test Song",
  artist: "Test Artist",
  image: "https://example.com/image.jpg",
  ...overrides,
});

describe("Card", () => {
  const defaultProps = {
    result: createResult(),
    onResultClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders result name", () => {
    render(<Card {...defaultProps} />);

    expect(screen.getByText("Test Song")).toBeInTheDocument();
  });

  it("renders result image when available", () => {
    render(<Card {...defaultProps} />);

    const img = screen.getByTestId("result-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("renders placeholder when no image", () => {
    render(<Card {...defaultProps} result={createResult({ image: undefined })} />);

    expect(screen.queryByTestId("result-image")).not.toBeInTheDocument();
  });

  it("renders type badge", () => {
    render(<Card {...defaultProps} />);

    expect(screen.getByText("Track")).toBeInTheDocument();
  });

  it("renders Album badge for albums", () => {
    render(<Card {...defaultProps} result={createResult({ type: ContentType.enum.album })} />);

    expect(screen.getByText("Album")).toBeInTheDocument();
  });

  it("renders Artist badge for artists", () => {
    render(<Card {...defaultProps} result={createResult({ type: ContentType.enum.artist })} />);

    expect(screen.getByText("Artist")).toBeInTheDocument();
  });

  it("calls onResultClick with id and type when clicked", () => {
    const onResultClick = vi.fn();
    render(<Card {...defaultProps} onResultClick={onResultClick} result={createResult({ id: "song-123", type: ContentType.enum.track })} />);

    fireEvent.click(screen.getByText("Test Song"));

    expect(onResultClick).toHaveBeenCalledWith("song-123", ContentType.enum.track);
  });

  it("shows coming soon modal for playlists", () => {
    render(<Card {...defaultProps} result={createResult({ type: ContentType.enum.playlist })} />);

    fireEvent.click(screen.getByText("Test Song"));

    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(screen.getByText("Playlist requests will be available soon.")).toBeInTheDocument();
  });

  it("does not call onResultClick for playlists", () => {
    const onResultClick = vi.fn();
    render(<Card {...defaultProps} onResultClick={onResultClick} result={createResult({ type: ContentType.enum.playlist })} />);

    fireEvent.click(screen.getByText("Test Song"));

    expect(onResultClick).not.toHaveBeenCalled();
  });

  it("renders secondary info for tracks", () => {
    render(
      <Card
        {...defaultProps}
        result={createResult({
          artist: "Cool Artist",
          album: "Great Album",
        })}
      />
    );

    expect(screen.getByText(/Cool Artist/)).toBeInTheDocument();
  });

  it("applies data-cy attribute", () => {
    const { container } = render(<Card {...defaultProps} />);

    expect(container.querySelector('[data-cy="search-result-card-track"]')).toBeInTheDocument();
  });
});
