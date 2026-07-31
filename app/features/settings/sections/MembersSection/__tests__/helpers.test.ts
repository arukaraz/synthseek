import { describe, it, expect } from "vitest";

import { Role } from "@api/__generated__/types";

import { createMockUser } from "@test/mocks/feature-hooks.mock";

import { buildRoleOptions, formatJoinedDate, roleLabel, roleTone, sortMembers } from "../helpers";
import type { MemberSort } from "../types";

import enSettings from "@modules/i18n/messages/en/settings.json";

const tIdentity = ((key: string) => key) as unknown as Parameters<typeof buildRoleOptions>[0];

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
