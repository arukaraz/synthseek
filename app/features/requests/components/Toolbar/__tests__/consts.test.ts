import { RequestStatus } from "@api/__generated__/types";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { describe, expect, it } from "vitest";

import { STATUS_FILTERS } from "../../../types";
import { STATUS_FILTER_ICONS } from "../consts";

describe("STATUS_FILTER_ICONS", () => {
  it("offers an icon for every selectable status filter", () => {
    expect(STATUS_FILTER_ICONS.map((option) => option.value)).toEqual([...STATUS_FILTERS]);
  });

  it("lists the pending approval group between all and active", () => {
    expect(STATUS_FILTER_ICONS.map((option) => option.value)).toEqual([
      "all",
      "pending_approval",
      "active",
      "done",
      "failed",
    ]);
  });

  it("draws the pending approval icon and colour from the shared status config", () => {
    const config = REQUEST_STATUS_CONFIG[RequestStatus.enum.pending_approval];
    const option = STATUS_FILTER_ICONS.find((entry) => entry.value === "pending_approval");

    expect(option?.icon).toBe(config.icon);
    expect(option?.iconClassName).toBe(config.color);
  });
});
