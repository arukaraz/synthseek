import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@test/test-utils";
import { LastRequestItem } from "../LastRequestItem";
import { RequestStatus } from "@api/__generated__/types";
import type { TrackRequestWithAlbum } from "@api/__generated__/types";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} data-testid="album-image" {...props} />
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    article: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <article {...props}>{children}</article>
    ),
  },
}));

const createRequest = (overrides: Partial<TrackRequestWithAlbum> = {}): TrackRequestWithAlbum => ({
  id: "test-id",
  title: "Test Track",
  artist: "Test Artist",
  spotify_id: "spotify:track:123",
  status: RequestStatus.enum.queued,
  request_type: "track",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  Album: {
    id: "album-1",
    spotify_id: "spotify:album:123",
    name: "Test Album",
    artist: "Test Artist",
    album_art: "https://example.com/album.jpg",
    user_id: "user-1",
    status: RequestStatus.enum.queued,
    total_tracks: 10,
    completed_tracks: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    release_date: null,
  },
  ...overrides,
});

describe("LastRequestItem", () => {
  it("renders track title", () => {
    render(<LastRequestItem request={createRequest({ title: "My Song" })} index={0} />);

    expect(screen.getByText("My Song")).toBeInTheDocument();
  });

  it("renders album name", () => {
    render(
      <LastRequestItem
        request={createRequest({
          Album: { ...createRequest().Album!, name: "Great Album" },
        })}
        index={0}
      />
    );

    expect(screen.getByText("Great Album")).toBeInTheDocument();
  });

  it("renders Unknown Album when Album is null", () => {
    render(<LastRequestItem request={createRequest({ Album: null })} index={0} />);

    expect(screen.getByText("Unknown Album")).toBeInTheDocument();
  });

  it("renders album art when available", () => {
    render(<LastRequestItem request={createRequest()} index={0} />);

    const img = screen.getByTestId("album-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/album.jpg");
  });

  it("renders placeholder when no album art", () => {
    render(
      <LastRequestItem
        request={createRequest({
          Album: { ...createRequest().Album!, album_art: null },
        })}
        index={0}
      />
    );

    expect(screen.queryByTestId("album-image")).not.toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<LastRequestItem request={createRequest({ status: RequestStatus.enum.complete })} index={0} />);

    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("renders different status badges", () => {
    const { rerender } = render(
      <LastRequestItem request={createRequest({ status: RequestStatus.enum.queued })} index={0} />
    );
    expect(screen.getByText("Queued")).toBeInTheDocument();

    rerender(<LastRequestItem request={createRequest({ status: RequestStatus.enum.downloading })} index={0} />);
    expect(screen.getByText("Downloading")).toBeInTheDocument();

    rerender(<LastRequestItem request={createRequest({ status: RequestStatus.enum.failed })} index={0} />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
