import { describe, expect, it } from "vitest";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { quotaStoragePending, quotaStorageValue, quotaTracksValue } from "../helpers";

const GB = 1024 ** 3;

describe("quotaTracksValue", () => {
  it("says there is no limit when the member has no track quota", () => {
    expect(quotaTracksValue({ limit: null, used: 9, windowDays: 7 })).toBe(enSettings.profile.quota.unlimited);
  });

  it("names the rolling window in days", () => {
    expect(quotaTracksValue({ limit: 50, used: 12, windowDays: 7 })).toBe("12 of 50 in the last 7 days");
  });

  it("uses the singular for a one-day window", () => {
    expect(quotaTracksValue({ limit: 5, used: 1, windowDays: 1 })).toBe("1 of 5 in the last day");
  });
});

describe("quotaStorageValue", () => {
  it("says there is no limit when the member has no storage quota", () => {
    expect(quotaStorageValue({ limitBytes: null, storedBytes: GB, pendingBytes: 0 })).toBe(
      enSettings.profile.quota.unlimited
    );
  });

  it("counts downloads still on their way toward the space used", () => {
    expect(quotaStorageValue({ limitBytes: 10 * GB, storedBytes: 2 * GB, pendingBytes: GB })).toBe("3.0 GB of 10.0 GB");
  });
});

describe("quotaStoragePending", () => {
  it("notes how much of the space is still downloading", () => {
    expect(quotaStoragePending({ limitBytes: 10 * GB, storedBytes: 2 * GB, pendingBytes: GB })).toBe(
      "Includes about 1.0 GB still downloading"
    );
  });

  it("stays silent when nothing is downloading", () => {
    expect(quotaStoragePending({ limitBytes: 10 * GB, storedBytes: 2 * GB, pendingBytes: 0 })).toBeNull();
  });

  it("stays silent when storage is not limited", () => {
    expect(quotaStoragePending({ limitBytes: null, storedBytes: 2 * GB, pendingBytes: GB })).toBeNull();
  });
});
