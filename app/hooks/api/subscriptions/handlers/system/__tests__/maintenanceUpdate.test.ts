import { beforeEach, describe, expect, it, vi } from "vitest";

import { SubscriptionEventType, type MaintenanceUpdatePayload } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

import { handleMaintenanceUpdate } from "../maintenanceUpdate";

const spies = vi.hoisted(() => ({
  counts: vi.fn(),
  systemStatus: vi.fn(),
  reviewList: vi.fn(),
  duplicateGroups: vi.fn(),
  scanStatus: vi.fn(),
  recycleBinList: vi.fn(),
  recycleBinStatus: vi.fn(),
  quarantineList: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      maintenance: {
        counts: { invalidate: spies.counts },
        systemStatus: { invalidate: spies.systemStatus },
      },
      requests: { review: { list: { invalidate: spies.reviewList } } },
      library: {
        scan: { duplicateGroups: { invalidate: spies.duplicateGroups }, status: { invalidate: spies.scanStatus } },
      },
      settings: {
        recycleBin: { list: { invalidate: spies.recycleBinList }, status: { invalidate: spies.recycleBinStatus } },
        quarantine: { list: { invalidate: spies.quarantineList } },
      },
    }),
  },
}));

function event(surface: MaintenanceUpdatePayload["surface"]): MaintenanceUpdatePayload {
  return { eventType: SubscriptionEventType.MaintenanceUpdate, surface };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("handleMaintenanceUpdate", () => {
  it("refetches the system status when the set of problems changes, so the notice and the page follow it", () => {
    handleMaintenanceUpdate(event("systemStatus"), trpc.useUtils());

    expect(spies.systemStatus).toHaveBeenCalledTimes(1);
  });

  it("refetches the counts on a system status change too, since they drive the sidebar badge", () => {
    handleMaintenanceUpdate(event("systemStatus"), trpc.useUtils());

    expect(spies.counts).toHaveBeenCalledTimes(1);
  });

  it("leaves the other maintenance surfaces alone on a system status change", () => {
    handleMaintenanceUpdate(event("systemStatus"), trpc.useUtils());

    expect(spies.reviewList).not.toHaveBeenCalled();
    expect(spies.duplicateGroups).not.toHaveBeenCalled();
    expect(spies.recycleBinList).not.toHaveBeenCalled();
    expect(spies.quarantineList).not.toHaveBeenCalled();
  });

  it("does not refetch the system status for another surface's change", () => {
    handleMaintenanceUpdate(event("quarantine"), trpc.useUtils());

    expect(spies.systemStatus).not.toHaveBeenCalled();
    expect(spies.quarantineList).toHaveBeenCalledTimes(1);
  });
});
