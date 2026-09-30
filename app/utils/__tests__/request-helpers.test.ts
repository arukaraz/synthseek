import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isSingleTrackRequest,
  notifyBulkTrackLimit,
  notifyBulkUpgradeOutcome,
  notifyRequestsRetried,
  notifyTracksRetried,
  notifyUpgradeOutcome,
  type UpgradeTrackResult,
} from "../request-helpers";
import { ContentType, ReclaimOutcome } from "@api/__generated__/types";
import { createTrackRequest } from "@test/factories";

import enErrors from "@modules/i18n/messages/en/errors.json";
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

describe("notifyTracksRetried", () => {
  const STORAGE_REFUSAL = {
    appCode: "QUOTA_STORAGE_EXCEEDED",
    appParams: { usedBytes: 3_221_225_472, limitBytes: 4_294_967_296, requestedBytes: 2_147_483_648 },
    message: "Storage quota reached",
  };
  const storageDescription = enErrors.QUOTA_STORAGE_EXCEEDED.description
    .replace("{{usedBytes}}", "3.0 GB")
    .replace("{{limitBytes}}", "4.0 GB")
    .replace("{{requestedBytes}}", "2.0 GB");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports the retried count when every track was retried", () => {
    notifyTracksRetried({ requested: 3, retried: 3, skipped: [], refusal: null });

    expect(toastSpies.success).toHaveBeenCalledWith(
      enMutations.requests.tracksRetried_other.replace("{{count}}", "3"),
      {
        description: undefined,
      }
    );
    expect(toastSpies.warning).not.toHaveBeenCalled();
  });

  it("lists the skips by reason under the retried count", () => {
    notifyTracksRetried({
      requested: 4,
      retried: 1,
      skipped: [
        { id: "a", reason: "notFound" },
        { id: "b", reason: "notFound" },
        { id: "c", reason: "forbidden" },
      ],
      refusal: null,
    });

    expect(toastSpies.success).toHaveBeenCalledWith(enMutations.requests.tracksRetried_one.replace("{{count}}", "1"), {
      description: "3 skipped: 2 not found · 1 not allowed",
    });
  });

  it("warns with the reasons when nothing was retried", () => {
    notifyTracksRetried({
      requested: 1,
      retried: 0,
      skipped: [{ id: "a", reason: "notRetryable" }],
      refusal: null,
    });

    expect(toastSpies.warning).toHaveBeenCalledWith(enMutations.requests.tracksRetryAllSkipped, {
      description: "1 not retryable",
    });
    expect(toastSpies.success).not.toHaveBeenCalled();
  });

  it("says there was nothing to retry when the set was empty", () => {
    notifyTracksRetried({ requested: 0, retried: 0, skipped: [], refusal: null });

    expect(toastSpies.info).toHaveBeenCalledWith(enMutations.requests.noFailedToRetry);
  });

  it("says how many it retried and which quota stopped the rest", () => {
    notifyTracksRetried({
      requested: 3,
      retried: 2,
      skipped: [{ id: "c", reason: "quotaExceeded" }],
      refusal: STORAGE_REFUSAL,
    });

    expect(toastSpies.warning).toHaveBeenCalledWith(
      enMutations.requests.tracksRetriedUntilQuota_other.replace("{{count}}", "2"),
      { description: storageDescription, duration: 12000 }
    );
    expect(toastSpies.success).not.toHaveBeenCalled();
  });

  it("keeps the skips that were not the quota's in the same notice", () => {
    notifyTracksRetried({
      requested: 3,
      retried: 1,
      skipped: [
        { id: "a", reason: "notFound" },
        { id: "c", reason: "quotaExceeded" },
      ],
      refusal: STORAGE_REFUSAL,
    });

    const [, options] = toastSpies.warning.mock.calls[0];
    expect(options.description).toBe(`${storageDescription} 1 skipped: 1 not found`);
  });

  it("shows the quota's own notice when the quota stopped the very first track", () => {
    notifyTracksRetried({
      requested: 2,
      retried: 0,
      skipped: [
        { id: "a", reason: "quotaExceeded" },
        { id: "b", reason: "quotaExceeded" },
      ],
      refusal: STORAGE_REFUSAL,
    });

    expect(toastSpies.warning).toHaveBeenCalledWith(enErrors.QUOTA_STORAGE_EXCEEDED.title, {
      description: storageDescription,
      duration: 12000,
    });
    expect(toastSpies.info).not.toHaveBeenCalled();
  });

  it("keeps the other skips in the quota's own notice when nothing was retried", () => {
    notifyTracksRetried({
      requested: 2,
      retried: 0,
      skipped: [
        { id: "a", reason: "forbidden" },
        { id: "b", reason: "quotaExceeded" },
      ],
      refusal: STORAGE_REFUSAL,
    });

    const [title, options] = toastSpies.warning.mock.calls[0];
    expect(title).toBe(enErrors.QUOTA_STORAGE_EXCEEDED.title);
    expect(options.description).toBe(`${storageDescription} 1 skipped: 1 not allowed`);
  });

  it("falls back to the server's own words for a refusal code this build does not know", () => {
    notifyTracksRetried({
      requested: 2,
      retried: 1,
      skipped: [{ id: "b", reason: "quotaExceeded" }],
      refusal: { appCode: "QUOTA_FROM_A_NEWER_SERVER", appParams: {}, message: "A newer quota stopped this" },
    });

    const [, options] = toastSpies.warning.mock.calls[0];
    expect(options.description).toBe("A newer quota stopped this");
  });
});

describe("notifyRequestsRetried", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports the retried count when nothing stopped the run", () => {
    notifyRequestsRetried({ retried: 2, failed: 0, refusal: null });

    expect(toastSpies.success).toHaveBeenCalledWith(enMutations.requests.retrying_other.replace("{{count}}", "2"));
  });

  it("says there was nothing to retry", () => {
    notifyRequestsRetried({ retried: 0, failed: 0, refusal: null });

    expect(toastSpies.info).toHaveBeenCalledWith(enMutations.requests.noFailedToRetry);
  });

  it("says how many requests it retried and which quota stopped the rest", () => {
    notifyRequestsRetried({
      retried: 1,
      failed: 0,
      refusal: {
        appCode: "QUOTA_LIBRARY_FULL",
        appParams: { usedBytes: 1_073_741_824, limitBytes: 1_073_741_824, requestedBytes: 1_048_576 },
        message: "The library is full",
      },
    });

    expect(toastSpies.warning).toHaveBeenCalledWith(
      enMutations.requests.retryingUntilQuota_one.replace("{{count}}", "1"),
      {
        description: enErrors.QUOTA_LIBRARY_FULL.description
          .replace("{{usedBytes}}", "1.0 GB")
          .replace("{{limitBytes}}", "1.0 GB")
          .replace("{{requestedBytes}}", "1.0 MB"),
        duration: 12000,
      }
    );
    expect(toastSpies.success).not.toHaveBeenCalled();
  });

  it("shows the quota's own notice when the quota stopped the very first request", () => {
    notifyRequestsRetried({
      retried: 0,
      failed: 0,
      refusal: {
        appCode: "QUOTA_LIBRARY_FULL",
        appParams: { usedBytes: 1_073_741_824, limitBytes: 1_073_741_824, requestedBytes: 1_048_576 },
        message: "The library is full",
      },
    });

    const [title] = toastSpies.warning.mock.calls[0];
    expect(title).toBe(enErrors.QUOTA_LIBRARY_FULL.title);
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
