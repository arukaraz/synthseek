import { describe, expect, it } from "vitest";

import { render, screen } from "@test/test-utils";

import { DiscoveryMixCardEmpty } from "../DiscoveryMixCardEmpty";
import { LB_KIND_METADATA } from "../constants";
import { createEmptyMix } from "./fixtures";

describe("DiscoveryMixCardEmpty", () => {
  it("renders the localized label and tag for the empty kind", () => {
    render(<DiscoveryMixCardEmpty mix={createEmptyMix({ kind: "weekly-jams" })} />);

    expect(screen.getByRole("heading", { level: 3, name: "Weekly Jams" })).toBeInTheDocument();
    expect(screen.getByText("Refreshes Mondays")).toBeInTheDocument();
  });

  it("marks the card as disabled and stamps the kind accent", () => {
    const { container } = render(<DiscoveryMixCardEmpty mix={createEmptyMix({ kind: "weekly-exploration" })} />);

    const card = container.querySelector("[aria-disabled='true']");
    expect(card).not.toBeNull();
    expect(card).toHaveAttribute("data-acc", LB_KIND_METADATA["weekly-exploration"].acc);
  });

  it("explains the first-sync wait when the mix has never been generated", () => {
    render(<DiscoveryMixCardEmpty mix={createEmptyMix({ status: "none", emptyReason: undefined })} />);

    expect(screen.getByText("Waiting for the first ListenBrainz sync.")).toBeInTheDocument();
  });

  it("explains the known empty reason when the feed produced no songs", () => {
    render(<DiscoveryMixCardEmpty mix={createEmptyMix({ status: "empty", emptyReason: "fetch-error" })} />);

    expect(screen.getByText("Couldn't reach ListenBrainz. It will retry on the next sync.")).toBeInTheDocument();
  });
});
