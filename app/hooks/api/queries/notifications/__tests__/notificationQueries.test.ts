import { describe, expect, it, vi } from "vitest";

const spies = vi.hoisted(() => ({
  catalog: vi.fn(),
  list: vi.fn(),
  adminSettings: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    notifications: {
      catalog: { useQuery: spies.catalog },
      list: { useQuery: spies.list },
      adminSettings: { useQuery: spies.adminSettings },
    },
  },
}));

import { useNotificationAdminSettings, useNotificationCatalog, useNotificationDestinations } from "..";

describe("notification queries", () => {
  it("refetches the catalog on every mount, because an admin can change the members' ntfy server", () => {
    useNotificationCatalog();

    expect(spies.catalog).toHaveBeenCalledWith(undefined, expect.objectContaining({ refetchOnMount: "always" }));
  });

  it("refetches the destinations on every mount, because each delivery moves their status", () => {
    useNotificationDestinations();

    expect(spies.list).toHaveBeenCalledWith(undefined, expect.objectContaining({ refetchOnMount: "always" }));
  });

  it("reads the admin settings", () => {
    useNotificationAdminSettings();

    expect(spies.adminSettings).toHaveBeenCalledOnce();
  });
});
