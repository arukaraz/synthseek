import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import type { MusicTrack } from "@api/__generated__/types";
import { CoverflowCard } from "../CoverflowCard";
import type { CardTransform } from "../types";

const flow = vi.hoisted(() => ({ requestResult: vi.fn() }));
const auth = vi.hoisted(() => ({ role: "admin" }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { role: auth.role } }),
}));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ requestResult: flow.requestResult }),
}));

vi.mock("@features/search/components/ConfigRequestModal/ConfigRequestModal", () => ({
  ConfigRequestModal: (props: { onClose: () => void }) => (
    <div data-testid="config-request-modal">
      <button type="button" onClick={props.onClose}>
        close-modal
      </button>
    </div>
  ),
}));

vi.mock("@components/ImageWithFallback/ImageWithFallback", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  ImageWithFallback: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

function createTrack(overrides: Partial<MusicTrack> = {}): MusicTrack {
  return {
    type: "track",
    id: "track-1",
    title: "Cover Track",
    artist: "Artist",
    artists: [{ id: "a", name: "Cover Artist" }],
    album: { id: "alb", name: "Alb", images: [] },
    duration_ms: 1000,
    track_number: 1,
    disc_number: 1,
    isrc: null,
    explicit: false,
    popularity: null,
    preview_url: null,
    images: [{ url: "https://img/x.jpg", width: 1, height: 1 }],
    ...overrides,
  };
}

const transform: CardTransform = { translateX: 0, rotateY: 0, scale: 1, opacity: 1, zIndex: 100 };

function buildProps(overrides: Partial<React.ComponentProps<typeof CoverflowCard>> = {}) {
  return {
    imageUrl: "https://img/x.jpg",
    track: createTrack(),
    transform,
    isCenter: true,
    index: 0,
    onClick: vi.fn(),
    ...overrides,
  };
}

describe("CoverflowCard", () => {
  afterEach(() => {
    vi.clearAllMocks();
    auth.role = "admin";
  });

  it("renders the track title and artist", () => {
    render(
      <CoverflowCard
        {...buildProps({ track: createTrack({ title: "Hello", artists: [{ id: "a", name: "World" }] }) })}
      />
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("renders the trending badge and download button only when centered", () => {
    render(<CoverflowCard {...buildProps({ isCenter: true })} />);

    expect(screen.getByText("Trending")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Download: / })).toBeInTheDocument();
  });

  it("hides the badge and download button when not centered", () => {
    render(<CoverflowCard {...buildProps({ isCenter: false })} />);

    expect(screen.queryByText("Trending")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Download: / })).not.toBeInTheDocument();
  });

  it("renders unknown fallbacks when title and artist are missing", () => {
    const track = createTrack({ artists: [] });
    Reflect.deleteProperty(track, "title");

    render(<CoverflowCard {...buildProps({ track })} />);

    expect(screen.getByText("Unknown Track")).toBeInTheDocument();
    expect(screen.getByText("Unknown Artist")).toBeInTheDocument();
  });

  it("invokes onClick with its index when an off-center card is clicked", () => {
    const onClick = vi.fn();
    const { container } = render(<CoverflowCard {...buildProps({ isCenter: false, index: 4, onClick })} />);

    fireEvent.click(container.firstChild as HTMLElement);

    expect(onClick).toHaveBeenCalledWith(4);
  });

  it("does not invoke onClick when the centered card is clicked", () => {
    const onClick = vi.fn();
    const { container } = render(<CoverflowCard {...buildProps({ isCenter: true, onClick })} />);

    fireEvent.click(container.firstChild as HTMLElement);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("requests the track straight away from the download half, without opening the modal", () => {
    const track = createTrack();
    render(<CoverflowCard {...buildProps({ isCenter: true, track })} />);

    fireEvent.click(screen.getByRole("button", { name: /^Download: / }));

    expect(flow.requestResult).toHaveBeenCalledTimes(1);
    expect(flow.requestResult).toHaveBeenCalledWith(track, "direct");
    expect(screen.queryByTestId("config-request-modal")).not.toBeInTheDocument();
  });

  it("opens the request modal from the custom settings half, without requesting", () => {
    render(<CoverflowCard {...buildProps({ isCenter: true, track: createTrack({ title: "Cover Track" }) })} />);

    expect(screen.queryByTestId("config-request-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Request Cover Track with custom settings" }));

    expect(screen.getByTestId("config-request-modal")).toBeInTheDocument();
    expect(flow.requestResult).not.toHaveBeenCalled();
  });

  it("gives a member only the download half", () => {
    auth.role = "member";
    render(<CoverflowCard {...buildProps({ isCenter: true, track: createTrack({ title: "Cover Track" }) })} />);

    expect(screen.getByRole("button", { name: /^Download: / })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Request Cover Track with custom settings" })).not.toBeInTheDocument();
  });

  it.each(["Download: Cover Track", "Request Cover Track with custom settings"])(
    "does not propagate the card click when pressing %s on the center card",
    (name) => {
      const onClick = vi.fn();
      render(
        <CoverflowCard {...buildProps({ isCenter: true, onClick, track: createTrack({ title: "Cover Track" }) })} />
      );

      fireEvent.click(screen.getByRole("button", { name }));

      expect(onClick).not.toHaveBeenCalled();
    }
  );

  it("closes the request modal via onClose", () => {
    render(<CoverflowCard {...buildProps({ isCenter: true, track: createTrack({ title: "Cover Track" }) })} />);

    fireEvent.click(screen.getByRole("button", { name: "Request Cover Track with custom settings" }));
    fireEvent.click(screen.getByText("close-modal"));

    expect(screen.queryByTestId("config-request-modal")).not.toBeInTheDocument();
  });

  it("renders the cover alt text from title and artist", () => {
    render(
      <CoverflowCard {...buildProps({ track: createTrack({ title: "Tune", artists: [{ id: "a", name: "Band" }] }) })} />
    );

    expect(screen.getByAltText("Tune by Band")).toBeInTheDocument();
  });
});
