import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isSingleTrackRequest,
  notifyBulkTrackLimit,
  notifyBulkUpgradeOutcome,
  notifyUpgradeOutcome,
  type UpgradeTrackResult,
} from "../request-helpers";
import { ContentType, ReclaimOutcome } from "@api/__generated__/types";
import { createTrackRequest } from "@test/factories";

import enMutations from "@modules/i18n/messages/en/mutations.json";

const toastSpies = vi.hoisted(() => ({
  success: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: toastSpies }));

describe("isSingleTrackRequest", () => {
  it("returns false for empty array", () => {
    expect(isSingleTrackRequest([])).toBe(false);
  });

  it("returns true for single track with type track", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.track });
    expect(isSingleTrackRequest([track])).toBe(true);
  });

  it("returns false for single track with type album", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.album });
    expect(isSingleTrackRequest([track])).toBe(false);
  });

  it("returns false for multiple tracks", () => {
    const tracks = [
      createTrackRequest({ request_type: ContentType.enum.track }),
      createTrackRequest({ request_type: ContentType.enum.track }),
    ];
    expect(isSingleTrackRequest(tracks)).toBe(false);
  });

  it("returns false for single track with type playlist", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.playlist });
    expect(isSingleTrackRequest([track])).toBe(false);
  });

  it("returns false for single track with type artist", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.artist });
    expect(isSingleTrackRequest([track])).toBe(false);
  });
});

describe("notifyUpgradeOutcome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toasts the upgrade-started copy when the track was requeued", () => {
    notifyUpgradeOutcome({ outcome: ReclaimOutcome.enum.requeued, itemName: "Artist - Song" });

    expect(toastSpies.success).toHaveBeenCalledWith(enMutations.requests.upgradeStartedTitle, {
      description: enMutations.requests.upgradeStartedDescription.replace("{{itemName}}", "Artist - Song"),
    });
    expect(toastSpies.info).not.toHaveBeenCalled();
  });

  it("toasts the upgrades-disabled copy when the server left the track already complete", () => {
    notifyUpgradeOutcome({ outcome: ReclaimOutcome.enum.already_complete, itemName: "Artist - Song" });

    expect(toastSpies.info).toHaveBeenCalledWith(enMutations.requests.upgradeDisabledTitle, {
      description: enMutations.requests.upgradeDisabledDescription.replace("{{itemName}}", "Artist - Song"),
    });
    expect(toastSpies.success).not.toHaveBeenCalled();
  });

  it("falls back to the generic reclaim toast for any other outcome", () => {
    notifyUpgradeOutcome({ outcome: ReclaimOutcome.enum.already_in_progress, itemName: "Artist - Song" });

    expect(toastSpies.info).toHaveBeenCalledWith(
      enMutations.requests.reclaim.alreadyInProgressTitle.replace("{{kind}}", enMutations.requests.reclaim.download),
      { description: "Artist - Song" }
    );
  });
});

describe("notifyBulkUpgradeOutcome", () => {
  const queued = (trackId: string): UpgradeTrackResult => ({ outcome: "queued", trackId });
  const pending = (trackId: string): UpgradeTrackResult => ({ outcome: "pendingApproval", trackId });
  const skipped = (
    trackId: string,
    reason: "notFound" | "forbidden" | "notComplete" | "upgradesDisabled"
  ): UpgradeTrackResult => ({
    outcome: "skipped",
    trackId,
    reason,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports only the queued count when every track was queued", () => {
    notifyBulkUpgradeOutcome([queued("a"), queued("b"), queued("c")]);

    expect(toastSpies.success).toHaveBeenCalledWith(
      enMutations.requests.tracksUpgrading_other.replace("{{count}}", "3"),
      { description: undefined }
    );
  });

  it("keeps the queued count honest and lists the skips when the batch partially succeeded", () => {
    notifyBulkUpgradeOutcome([
      queued("a"),
      skipped("b", "notComplete"),
      skipped("c", "notComplete"),
      skipped("d", "forbidden"),
    ]);

    expect(toastSpies.success).toHaveBeenCalledTimes(1);
    const [title, options] = toastSpies.success.mock.calls[0];
    expect(title).toBe(enMutations.requests.tracksUpgrading_one.replace("{{count}}", "1"));
    expect(options.description).toContain("3 skipped");
    expect(options.description).toContain("2 not complete");
    expect(options.description).toContain("1 not allowed");
  });

  it("surfaces the tracks parked for approval alongside the queued ones", () => {
    notifyBulkUpgradeOutcome([queued("a"), pending("b"), pending("c")]);

    const [, options] = toastSpies.success.mock.calls[0];
    expect(options.description).toContain(enMutations.requests.tracksUpgradePending_other.replace("{{count}}", "2"));
  });

  it("titles the toast for approval when nothing was queued but tracks were held", () => {
    notifyBulkUpgradeOutcome([pending("a"), pending("b")]);

    expect(toastSpies.info).toHaveBeenCalledWith(
      enMutations.requests.tracksUpgradeSentForApproval_other.replace("{{count}}", "2"),
      { description: undefined }
    );
    expect(toastSpies.success).not.toHaveBeenCalled();
  });

  it("says upgrades are disabled, not that anything was queued, when the whole set was gated off", () => {
    notifyBulkUpgradeOutcome([skipped("a", "upgradesDisabled"), skipped("b", "upgradesDisabled")]);

    expect(toastSpies.info).toHaveBeenCalledWith(enMutations.requests.upgradeDisabledTitle, {
      description: enMutations.requests.upgradeDisabledBulkDescription_other.replace("{{count}}", "2"),
    });
    expect(toastSpies.success).not.toHaveBeenCalled();
    expect(toastSpies.warning).not.toHaveBeenCalled();
  });

  it("warns with the grouped reasons when every track was skipped for mixed reasons", () => {
    notifyBulkUpgradeOutcome([skipped("a", "notFound"), skipped("b", "upgradesDisabled")]);

    expect(toastSpies.warning).toHaveBeenCalledTimes(1);
    const [title, options] = toastSpies.warning.mock.calls[0];
    expect(title).toBe(enMutations.requests.tracksUpgradeAllSkipped);
    expect(options.description).toContain("1 not found");
    expect(options.description).toContain("1 with upgrades disabled");
    expect(toastSpies.info).not.toHaveBeenCalled();
  });

  it("does not claim upgrades are disabled when at least one track was queued", () => {
    notifyBulkUpgradeOutcome([queued("a"), skipped("b", "upgradesDisabled")]);

    expect(toastSpies.success).toHaveBeenCalledTimes(1);
    expect(toastSpies.info).not.toHaveBeenCalled();
  });
});

describe("notifyBulkTrackLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("warns with the cap and says nothing was submitted", () => {
    notifyBulkTrackLimit(500);

    expect(toastSpies.warning).toHaveBeenCalledWith(enMutations.requests.bulkTracksTooManyTitle, {
      description: enMutations.requests.bulkTracksTooManyDescription.replace("{{max}}", "500"),
    });
  });
});
