import { describe, expect, it } from "vitest";

import { RequestStatus } from "@api/__generated__/types";
import { REQUEST_STATUS_CONFIG } from "../statusConfig";

describe("REQUEST_STATUS_CONFIG", () => {
  it("covers every RequestStatus value", () => {
    for (const status of RequestStatus.options) {
      const config = REQUEST_STATUS_CONFIG[status];
      expect(config, `missing config for ${status}`).toBeDefined();
      expect(config.icon).toBeDefined();
      expect(config.color.length).toBeGreaterThan(0);
    }
  });

  it("covers pending_approval with its own visual identity", () => {
    const config = REQUEST_STATUS_CONFIG[RequestStatus.enum.pending_approval];
    expect(config).toBeDefined();
    expect(config.color).not.toBe(REQUEST_STATUS_CONFIG[RequestStatus.enum.queued].color);
  });
});
