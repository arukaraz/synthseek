import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@test/test-utils";
import { TrendingHeroSlide } from "../TrendingHeroSlide";
import { createTrendingItem } from "./fixtures";

const configModalMock = vi.fn();
const flow = vi.hoisted(() => ({ requestResult: vi.fn() }));
const auth = vi.hoisted(() => ({ role: "admin" }));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { role: auth.role } }),
}));

vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ requestResult: flow.requestResult }),
}));

vi.mock("@features/search/components/ConfigRequestModal/ConfigRequestModal", () => ({
  ConfigRequestModal: (props: { isOpen: boolean; item: { title?: string }; onClose: () => void }) => {
    configModalMock(props);
    return (
      <div data-testid="config-request-modal" data-item-title={props.item.title}>
        <button type="button" onClick={props.onClose}>
          close-modal
        </button>
      </div>
    );
  },
}));

vi.mock("@components/ImageWithFallback/ImageWithFallback", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  ImageWithFallback: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const baseProps = {
  currentIndex: 0,
  total: 3,
  onIndexChange: vi.fn(),
  onRequestOpenChange: vi.fn(),
  info: "What is trending right now",
};

describe("TrendingHeroSlide", () => {
  afterEach(() => {
    vi.clearAllMocks();
    auth.role = "admin";
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

  it("requests the track straight away from the first half, without opening the modal", () => {
    const item = createTrendingItem({ title: "Open Me" });
    render(<TrendingHeroSlide item={item} {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: /^Request: / }));

    expect(flow.requestResult).toHaveBeenCalledTimes(1);
    expect(flow.requestResult).toHaveBeenCalledWith(item.track, "direct");
    expect(screen.queryByTestId("config-request-modal")).not.toBeInTheDocument();
    expect(baseProps.onRequestOpenChange).not.toHaveBeenCalled();
  });

  it("opens the request modal from the custom settings half, without requesting", () => {
    render(<TrendingHeroSlide item={createTrendingItem({ title: "Open Me" })} {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Request Open Me with custom settings" }));

    expect(screen.getByTestId("config-request-modal")).toBeInTheDocument();
    expect(flow.requestResult).not.toHaveBeenCalled();
  });

  it("gives a member only the direct half", () => {
    auth.role = "member";
    render(<TrendingHeroSlide item={createTrendingItem({ title: "Open Me" })} {...baseProps} />);

    expect(screen.getByRole("button", { name: /^Request: / })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Request Open Me with custom settings" })).not.toBeInTheDocument();
  });

  it.each(["Request: Bubble", "Request Bubble with custom settings"])(
    "stops propagation so a slide click does not bubble when pressing %s",
    (name) => {
      const onParentClick = vi.fn();
      render(
        <div onClick={onParentClick}>
          <TrendingHeroSlide item={createTrendingItem({ title: "Bubble" })} {...baseProps} />
        </div>
      );

      fireEvent.click(screen.getByRole("button", { name }));

      expect(onParentClick).not.toHaveBeenCalled();
    }
  );

  it("closes the request modal via the onClose callback", () => {
    render(<TrendingHeroSlide item={createTrendingItem({ title: "Close" })} {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Request Close with custom settings" }));
    expect(screen.getByTestId("config-request-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-modal"));
    expect(screen.queryByTestId("config-request-modal")).not.toBeInTheDocument();
  });

  it("reports the request dialog opening and closing", () => {
    render(<TrendingHeroSlide item={createTrendingItem({ title: "Report" })} {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Request Report with custom settings" }));
    expect(baseProps.onRequestOpenChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByText("close-modal"));
    expect(baseProps.onRequestOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps the request dialog on the track it was opened for when the slide changes", () => {
    const { rerender } = render(<TrendingHeroSlide item={createTrendingItem({ title: "First" })} {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Request First with custom settings" }));
    rerender(<TrendingHeroSlide item={createTrendingItem({ id: "other", title: "Second" })} {...baseProps} />);

    expect(screen.getByTestId("config-request-modal")).toHaveAttribute("data-item-title", "First");
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
