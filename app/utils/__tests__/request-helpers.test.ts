import { describe, it, expect, vi, beforeEach } from "vitest";
import { isSingleTrackRequest, notifyUpgradeOutcome } from "../request-helpers";
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
