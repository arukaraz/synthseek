import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { DiscoveryMixCard } from "../DiscoveryMixCard";
import { LB_KIND_METADATA } from "../constants";
import { createCandidate, createReadyMix } from "./fixtures";

vi.mock("../DiscoveryMixMosaic", () => ({
  DiscoveryMixMosaic: ({ fallbackSeed }: { fallbackSeed: string }) => (
    <div data-testid="mosaic" data-seed={fallbackSeed} />
  ),
}));

describe("DiscoveryMixCard", () => {
  it("renders the localized label, tag and blurb for the mix kind", () => {
    render(<DiscoveryMixCard mix={createReadyMix({ kind: "daily-jams" })} onClick={() => {}} />);

    expect(screen.getByRole("heading", { level: 3, name: "Daily Jams" })).toBeInTheDocument();
    expect(screen.getByText("Refreshes daily")).toBeInTheDocument();
    expect(
      screen.getByText("A comfortable background mix of recordings you already love, regenerated every morning.")
    ).toBeInTheDocument();
  });

  it("labels the button with the kind and candidate count for screen readers", () => {
    render(
      <DiscoveryMixCard
        mix={createReadyMix({
          candidates: [createCandidate({ catalogTrackId: "a" }), createCandidate({ catalogTrackId: "b" })],
        })}
        onClick={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: "Open Daily Jams mix, 2 tracks" })).toBeInTheDocument();
  });

  it("renders the pluralized track count in the footer", () => {
    render(
      <DiscoveryMixCard
        mix={createReadyMix({
          candidates: [
            createCandidate({ catalogTrackId: "x" }),
            createCandidate({ catalogTrackId: "y" }),
            createCandidate({ catalogTrackId: "z" }),
          ],
        })}
        onClick={() => {}}
      />
    );

    expect(screen.getByText("3 tracks")).toBeInTheDocument();
  });

  it("passes the kind to the mosaic as the deterministic fallback seed", () => {
    render(<DiscoveryMixCard mix={createReadyMix({ kind: "weekly-jams" })} onClick={() => {}} />);

    expect(screen.getByTestId("mosaic")).toHaveAttribute("data-seed", "weekly-jams");
  });

  it("stamps the accent of the kind onto the card", () => {
    render(<DiscoveryMixCard mix={createReadyMix({ kind: "cf-recommendations" })} onClick={() => {}} />);

    expect(screen.getByRole("button")).toHaveAttribute("data-acc", LB_KIND_METADATA["cf-recommendations"].acc);
  });

  it("omits the freshness pill when the mix has never been generated", () => {
    render(<DiscoveryMixCard mix={createReadyMix({ generatedAt: undefined })} onClick={() => {}} />);

    expect(screen.queryByText(/Updated|Synced/)).not.toBeInTheDocument();
  });

  it("invokes onClick when the card is pressed", () => {
    const onClick = vi.fn();
    render(<DiscoveryMixCard mix={createReadyMix()} onClick={onClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
