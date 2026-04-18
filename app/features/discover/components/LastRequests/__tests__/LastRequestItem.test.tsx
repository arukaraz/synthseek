import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@test/test-utils";
import { LastRequestItem } from "../LastRequestItem";
import { RequestStatus } from "@api/__generated__/types";
import type { FlatTrackRow } from "@features/requests/types";

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
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

const baseParent: FlatTrackRow["parent"] = {
  id: "album-1",
  name: "Test Album",
  artist: "Test Artist",
  album_art: "https://example.com/album.jpg",
  contentType: "album",
};

const createRequest = (overrides: Partial<FlatTrackRow> = {}): FlatTrackRow => ({
  id: "test-id",
  slskd_request_id: "req_1",
  title: "Test Track",
  artist: "Test Artist",
  external_id: "track:123",
  status: RequestStatus.enum.queued,
  request_type: "track",
  user_id: null,
  isrc: null,
  track_number: 1,
  disc_number: 1,
  duration_ms: 180_000,
  progress: 0,
  bitrate: 320,
  format: "mp3",
  format_matching: "flexible",
  bitrate_matching: "flexible",
  album_id: "album-1",
  error: null,
  explicit: false,
  source: "deezer",
  created_at: new Date(),
  completed_at: null,
  updated_at: new Date(),
  parent: baseParent,
  ...overrides,
});

describe("LastRequestItem", () => {
  it("renders track title", () => {
    render(<LastRequestItem request={createRequest({ title: "My Song" })} index={0} />);

    expect(screen.getByText("My Song")).toBeInTheDocument();
  });

  it("renders parent name", () => {
    render(<LastRequestItem request={createRequest({ parent: { ...baseParent, name: "Great Album" } })} index={0} />);

    expect(screen.getByText("Great Album")).toBeInTheDocument();
  });

  it("renders parent art when available", () => {
    render(<LastRequestItem request={createRequest()} index={0} />);

    const img = screen.getByTestId("album-image");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/album.jpg");
  });

  it("renders placeholder when no parent art", () => {
    render(<LastRequestItem request={createRequest({ parent: { ...baseParent, album_art: null } })} index={0} />);

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
