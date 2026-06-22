import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { TrendingHeroSlide } from "../TrendingHeroSlide";
import { createTrendingItem } from "./fixtures";

const configModalMock = vi.fn();

vi.mock("@features/search/components/ConfigRequestModal/ConfigRequestModal", () => ({
  ConfigRequestModal: (props: { isOpen: boolean; onClose: () => void }) => {
    configModalMock(props);
    return (
      <div data-testid="config-request-modal">
        <button type="button" onClick={props.onClose}>
          close-modal
        </button>
      </div>
    );
  },
}));

vi.mock("@components/ui/ImageWithFallback/ImageWithFallback", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  ImageWithFallback: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const baseProps = {
  currentIndex: 0,
  total: 3,
  onIndexChange: vi.fn(),
};

describe("TrendingHeroSlide", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the track title and primary artist name", () => {
    render(
      <TrendingHeroSlide
        item={createTrendingItem({ title: "Midnight", artists: [{ id: "a", name: "Daft Punk" }] })}
        {...baseProps}
      />
    );

    expect(screen.getByText("Midnight")).toBeInTheDocument();
    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
  });

  it("falls back to the artist string when the artists array is empty", () => {
    render(<TrendingHeroSlide item={createTrendingItem({ artists: [], artist: "Fallback Artist" })} {...baseProps} />);

    expect(screen.getByText("Fallback Artist")).toBeInTheDocument();
  });

  it("renders the unknown-track and unknown-artist copy when both are missing", () => {
    const item = createTrendingItem({ artists: [] });
    Reflect.deleteProperty(item.track, "title");
    Reflect.deleteProperty(item.track, "artist");

    render(<TrendingHeroSlide item={item} {...baseProps} />);

    expect(screen.getByText("Unknown Track")).toBeInTheDocument();
    expect(screen.getByText("Unknown Artist")).toBeInTheDocument();
  });

  it("does not render the request modal until the request button is pressed", () => {
    render(<TrendingHeroSlide item={createTrendingItem()} {...baseProps} />);

    expect(screen.queryByTestId("config-request-modal")).not.toBeInTheDocument();
  });

  it("opens the request modal when the request button is clicked", () => {
    render(<TrendingHeroSlide item={createTrendingItem({ title: "Open Me" })} {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Request Open Me" }));

    expect(screen.getByTestId("config-request-modal")).toBeInTheDocument();
  });

  it("stops propagation so a slide click does not bubble when requesting", () => {
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick}>
        <TrendingHeroSlide item={createTrendingItem()} {...baseProps} />
      </div>
    );

    fireEvent.click(screen.getByRole("button", { name: /Request/ }));

    expect(onParentClick).not.toHaveBeenCalled();
  });

  it("closes the request modal via the onClose callback", () => {
    render(<TrendingHeroSlide item={createTrendingItem()} {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Request/ }));
    expect(screen.getByTestId("config-request-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-modal"));
    expect(screen.queryByTestId("config-request-modal")).not.toBeInTheDocument();
  });

  it("renders the cover alt text built from title and artist", () => {
    render(
      <TrendingHeroSlide
        item={createTrendingItem({ title: "Cover", artists: [{ id: "a", name: "Artisto" }] })}
        {...baseProps}
      />
    );

    expect(screen.getByAltText("Cover by Artisto")).toBeInTheDocument();
  });
});
