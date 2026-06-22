import { describe, expect, it, vi } from "vitest";

import { render } from "@test/test-utils";

import { DiscoveryMixMosaic } from "../DiscoveryMixMosaic";
import { createCandidate } from "./fixtures";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe("DiscoveryMixMosaic", () => {
  it("renders a single gradient fallback when no candidate has an album image", () => {
    const { container } = render(
      <DiscoveryMixMosaic candidates={[createCandidate({ albumImage: null })]} fallbackSeed="daily-jams" />
    );

    const tiles = container.querySelectorAll("div[style*='linear-gradient']");
    expect(tiles).toHaveLength(1);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("renders an image tile per available cover and proxies the source", () => {
    const { container } = render(
      <DiscoveryMixMosaic
        candidates={[
          createCandidate({ catalogTrackId: "a", albumImage: "https://cover/a.jpg" }),
          createCandidate({ catalogTrackId: "b", albumImage: "https://cover/b.jpg" }),
        ]}
        fallbackSeed="weekly-jams"
      />
    );

    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
    expect(images[0].getAttribute("src")).toBe("https://cover/a.jpg");
  });

  it("pads the mosaic to four tiles with gradient fillers when fewer covers exist", () => {
    const { container } = render(
      <DiscoveryMixMosaic
        candidates={[createCandidate({ albumImage: "https://cover/only.jpg" })]}
        fallbackSeed="explore"
      />
    );

    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelectorAll("div[style*='linear-gradient']")).toHaveLength(3);
  });

  it("caps the mosaic at four image tiles even with more covers", () => {
    const candidates = Array.from({ length: 6 }, (_, i) =>
      createCandidate({ catalogTrackId: `c-${i}`, albumImage: `https://cover/${i}.jpg` })
    );

    const { container } = render(<DiscoveryMixMosaic candidates={candidates} fallbackSeed="cf" />);

    expect(container.querySelectorAll("img")).toHaveLength(4);
  });
});
