import { Library } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { WidgetHeader } from "../WidgetHeader";

describe("WidgetHeader", () => {
  it("renders the title and subtitle text", () => {
    render(<WidgetHeader icon={Library} title="Discover Mixes" subtitle="ListenBrainz" />);

    expect(screen.getByText("Discover Mixes")).toBeInTheDocument();
    expect(screen.getByText("ListenBrainz")).toBeInTheDocument();
  });

  it("defaults the title to an h2 heading", () => {
    render(<WidgetHeader icon={Library} title="Top Tracks" subtitle="Last.fm" />);

    expect(screen.getByRole("heading", { level: 2, name: "Top Tracks" })).toBeInTheDocument();
  });

  it("exposes the heading level through a prop", () => {
    render(<WidgetHeader icon={Library} title="Genres" subtitle="Explore" headingLevel="h3" />);

    expect(screen.getByRole("heading", { level: 3, name: "Genres" })).toBeInTheDocument();
  });

  it("places the subtitle as a sibling of the title so it aligns under the title, not the icon", () => {
    render(<WidgetHeader icon={Library} title="Recent Scrobbles" subtitle="Last.fm" />);

    const heading = screen.getByRole("heading", { level: 2, name: "Recent Scrobbles" });
    const subtitle = screen.getByText("Last.fm");
    expect(heading.parentElement).toBe(subtitle.parentElement);
  });

  it("renders a button action that fires onClick", () => {
    const onClick = vi.fn();
    render(<WidgetHeader icon={Library} title="Genres" subtitle="Explore" action={{ label: "See all", onClick }} />);

    fireEvent.click(screen.getByRole("button", { name: "See all" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders an external link action with safe rel attributes", () => {
    render(
      <WidgetHeader
        icon={Library}
        title="Recent Scrobbles"
        subtitle="Last.fm"
        action={{ label: "See more", ariaLabel: "Open Last.fm profile", href: "https://example.com", external: true }}
      />
    );

    const link = screen.getByRole("link", { name: "Open Last.fm profile" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("omits the action element when no action is provided", () => {
    render(<WidgetHeader icon={Library} title="Artist Spotlight" subtitle="Top artists in your region" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
