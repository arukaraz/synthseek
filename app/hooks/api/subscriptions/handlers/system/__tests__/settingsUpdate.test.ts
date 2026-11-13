import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetThrottledInvalidations } from "../../../shared/throttledInvalidation";
import { handleSettingsUpdate } from "../settingsUpdate";

const invalidate = vi.fn();

const utils = { settings: { get: { invalidate } } };

beforeEach(() => {
  vi.useFakeTimers();
  resetThrottledInvalidations();
  invalidate.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("handleSettingsUpdate", () => {
  it("rereads the settings at once for a single change", () => {
    handleSettingsUpdate(utils);

    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it("rereads them twice for a save that changes many keys, at its start and at its end", () => {
    for (let key = 0; key < 12; key++) handleSettingsUpdate(utils);

    expect(invalidate).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);

    expect(invalidate).toHaveBeenCalledTimes(2);
  });
});
