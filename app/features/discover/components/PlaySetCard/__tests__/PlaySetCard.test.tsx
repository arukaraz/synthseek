import { Repeat } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { PlaySetCard } from "../PlaySetCard";
import type { PlaySetCardProps } from "../types";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="cover" />,
}));

function props(overrides: Partial<PlaySetCardProps> = {}): PlaySetCardProps {
  return {
    accent: "daily",
    icon: Repeat,
    tag: "Last 30 days",
    title: "On repeat",
    blurb: "Your most played tracks lately.",
    footnote: "12 tracks",
    covers: ["https://cover/a.jpg", "https://cover/b.jpg"],
    seed: "onRepeat",
    playLabel: "Play On repeat",
    onPlay: vi.fn(),
    ...overrides,
  };
}

describe("PlaySetCard", () => {
  it("shows the tag, title, blurb and footnote over the accent of its set", () => {
    const { container } = render(<PlaySetCard {...props()} />);

    expect(screen.getByRole("heading", { level: 3, name: "On repeat" })).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Your most played tracks lately.")).toBeInTheDocument();
    expect(screen.getByText("12 tracks")).toBeInTheDocument();
    expect(container.querySelector("[data-acc='daily']")).not.toBeNull();
  });

  it("plays the set from its play button", () => {
    const onPlay = vi.fn();
    render(<PlaySetCard {...props({ onPlay })} />);

    fireEvent.click(screen.getByRole("button", { name: "Play On repeat" }));

    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("offers no play button when there is nothing to play", () => {
    render(<PlaySetCard {...props({ onPlay: null, footnote: null, blurb: null })} />);

    expect(screen.queryByRole("button", { name: "Play On repeat" })).not.toBeInTheDocument();
    expect(screen.queryByText("12 tracks")).not.toBeInTheDocument();
  });

  it("fills the poster with a single cover instead of a mosaic", () => {
    render(<PlaySetCard {...props({ covers: ["https://cover/only.jpg"] })} />);

    expect(screen.getAllByTestId("cover")).toHaveLength(1);
  });

  it("builds a mosaic from several covers", () => {
    render(<PlaySetCard {...props()} />);

    expect(screen.getAllByTestId("cover")).toHaveLength(2);
  });

  it("explains itself in an info tooltip when the card stands alone on the board", () => {
    render(<PlaySetCard {...props({ info: "What this set is" })} />);

    expect(screen.getByRole("button", { name: /more information/i })).toBeInTheDocument();
  });
});
