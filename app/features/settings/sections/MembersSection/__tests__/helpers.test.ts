import { describe, it, expect } from "vitest";

import { Role } from "@api/__generated__/types";

import { createMockUser } from "@test/mocks/feature-hooks.mock";

import {
  buildRoleOptions,
  formatJoinedDate,
  isValidQuotaInput,
  parseQuotaInput,
  quotaInputOf,
  quotaSummary,
  roleLabel,
  roleTone,
  sortMembers,
} from "../helpers";
import type { MemberSort } from "../types";

import enSettings from "@modules/i18n/messages/en/settings.json";

const tIdentity = ((key: string) => key) as unknown as Parameters<typeof buildRoleOptions>[0];

describe("quota inputs", () => {
  it("shows an unset override as an empty field", () => {
    expect(quotaInputOf(null)).toBe("");
    expect(quotaInputOf(0)).toBe("0");
    expect(quotaInputOf(2.5)).toBe("2.5");
  });

  it("reads an empty or blank field as following the global quota", () => {
    expect(parseQuotaInput("")).toBeNull();
    expect(parseQuotaInput("   ")).toBeNull();
    expect(parseQuotaInput(" 12 ")).toBe(12);
  });

  it("accepts an empty field, zero, and a whole track count", () => {
    expect(isValidQuotaInput("", true)).toBe(true);
    expect(isValidQuotaInput("0", true)).toBe(true);
    expect(isValidQuotaInput("25", true)).toBe(true);
  });

  it("rejects a fractional track count but accepts fractional gigabytes", () => {
    expect(isValidQuotaInput("2.5", true)).toBe(false);
    expect(isValidQuotaInput("2.5", false)).toBe(true);
  });

  it("rejects a negative amount and text that is not a number", () => {
    expect(isValidQuotaInput("-1", false)).toBe(false);
    expect(isValidQuotaInput("abc", false)).toBe(false);
    expect(isValidQuotaInput("Infinity", false)).toBe(false);
  });
});

describe("quotaSummary", () => {
  const quota = createMockUser().quota;

  it("names an exempt member instead of listing numbers", () => {
    expect(quotaSummary({ ...quota, exempt: true, tracks: { limit: 10, used: 3, windowDays: 7 } })).toEqual([
      enSettings.members.quotaCell.exempt,
    ]);
  });

  it("says there is no limit when neither quota is set", () => {
    expect(quotaSummary(quota)).toEqual([enSettings.members.quotaCell.unlimited]);
  });

  it("lists tracks used against the limit", () => {
    expect(quotaSummary({ ...quota, tracks: { limit: 50, used: 12, windowDays: 7 } })).toEqual(["Tracks 12/50"]);
  });

  it("counts downloads still on their way toward the storage used", () => {
    const lines = quotaSummary({
      ...quota,
      storage: { limitBytes: 10 * 1024 ** 3, storedBytes: 1024 ** 3, pendingBytes: 1024 ** 3 },
    });
    expect(lines).toEqual(["Space 2.0 GB/10.0 GB"]);
  });
});

describe("formatJoinedDate", () => {
  it("formats a date with a long month", () => {
    const formatted = formatJoinedDate(new Date("2024-03-15T00:00:00Z"));
    expect(formatted).toContain("2024");
    expect(formatted).toContain("March");
  });
});

describe("roleLabel", () => {
  it("returns the owner label for the owner", () => {
    expect(roleLabel(createMockUser({ isOwner: true }))).toBe(enSettings.members.role.owner);
  });

  it("returns the admin label for an admin", () => {
    expect(roleLabel(createMockUser({ role: Role.enum.admin }))).toBe(enSettings.members.role.admin);
  });

  it("returns the user label for a member", () => {
    expect(roleLabel(createMockUser({ role: Role.enum.member }))).toBe(enSettings.members.role.user);
  });

  it("returns the trusted label for a trusted member", () => {
    expect(roleLabel(createMockUser({ role: Role.enum.trusted }))).toBe(enSettings.members.role.trusted);
  });
});

describe("buildRoleOptions", () => {
  it("returns the member, trusted, and admin role values in order", () => {
    const options = buildRoleOptions(tIdentity);
    expect(options.map((option) => option.value)).toEqual([Role.enum.member, Role.enum.trusted, Role.enum.admin]);
  });
});

describe("roleTone", () => {
  it("returns owner tone for the owner", () => {
    expect(roleTone(createMockUser({ isOwner: true }))).toBe("owner");
  });

  it("returns admin tone for an admin", () => {
    expect(roleTone(createMockUser({ role: Role.enum.admin }))).toBe("admin");
  });

  it("returns member tone for a member", () => {
    expect(roleTone(createMockUser({ role: Role.enum.member }))).toBe("member");
  });

  it("returns trusted tone for a trusted member", () => {
    expect(roleTone(createMockUser({ role: Role.enum.trusted }))).toBe("trusted");
  });
});

describe("sortMembers", () => {
  const ascUser: MemberSort = { field: "user", direction: "asc" };

  it("sorts ascending by username", () => {
    const rows = [createMockUser({ id: "b", username: "bravo" }), createMockUser({ id: "a", username: "alpha" })];
    expect(sortMembers(rows, ascUser).map((row) => row.username)).toEqual(["alpha", "bravo"]);
  });

  it("sorts descending by username", () => {
    const rows = [createMockUser({ id: "a", username: "alpha" }), createMockUser({ id: "b", username: "bravo" })];
    const sorted = sortMembers(rows, { field: "user", direction: "desc" });
    expect(sorted.map((row) => row.username)).toEqual(["bravo", "alpha"]);
  });

  it("sorts by request count", () => {
    const rows = [createMockUser({ id: "a", requestCount: 5 }), createMockUser({ id: "b", requestCount: 1 })];
    const sorted = sortMembers(rows, { field: "requests", direction: "asc" });
    expect(sorted.map((row) => row.requestCount)).toEqual([1, 5]);
  });

  it("sorts by plex type", () => {
    const rows = [createMockUser({ id: "a", isPlexUser: true }), createMockUser({ id: "b", isPlexUser: false })];
    const sorted = sortMembers(rows, { field: "type", direction: "asc" });
    expect(sorted.map((row) => row.isPlexUser)).toEqual([false, true]);
  });

  it("sorts by role rank with owner highest", () => {
    const rows = [
      createMockUser({ id: "owner", isOwner: true }),
      createMockUser({ id: "member", role: Role.enum.member }),
      createMockUser({ id: "admin", role: Role.enum.admin }),
    ];
    const sorted = sortMembers(rows, { field: "role", direction: "asc" });
    expect(sorted.map((row) => row.id)).toEqual(["member", "admin", "owner"]);
  });

  it("sorts by how full each member's fullest quota is, with exempt members lowest", () => {
    const base = createMockUser().quota;
    const rows = [
      createMockUser({ id: "unlimited", quota: { ...base, tracks: { limit: null, used: 500, windowDays: 7 } } }),
      createMockUser({
        id: "tracks-full",
        quota: { ...base, tracks: { limit: 10, used: 9, windowDays: 7 } },
      }),
      createMockUser({
        id: "exempt",
        quota: { ...base, exempt: true, tracks: { limit: 10, used: 10, windowDays: 7 } },
      }),
      createMockUser({
        id: "storage-half",
        quota: { ...base, storage: { limitBytes: 100, storedBytes: 30, pendingBytes: 20 } },
      }),
      createMockUser({ id: "tracks-40", quota: { ...base, tracks: { limit: 10, used: 4, windowDays: 7 } } }),
    ];
    const sorted = sortMembers(rows, { field: "quota", direction: "asc" });
    expect(sorted.map((row) => row.id)).toEqual(["exempt", "unlimited", "tracks-40", "storage-half", "tracks-full"]);
  });

  it("sorts by joined date", () => {
    const rows = [
      createMockUser({ id: "late", created_at: new Date("2024-06-01T00:00:00Z") }),
      createMockUser({ id: "early", created_at: new Date("2024-01-01T00:00:00Z") }),
    ];
    const sorted = sortMembers(rows, { field: "joined", direction: "asc" });
    expect(sorted.map((row) => row.id)).toEqual(["early", "late"]);
  });

  it("preserves order for an unknown field", () => {
    const rows = [createMockUser({ id: "a" }), createMockUser({ id: "b" })];
    const sorted = sortMembers(rows, { field: "unknown", direction: "asc" });
    expect(sorted.map((row) => row.id)).toEqual(["a", "b"]);
  });
});
