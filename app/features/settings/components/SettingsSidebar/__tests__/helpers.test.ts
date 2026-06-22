import { describe, it, expect } from "vitest";

import { isAdminOnlySettingsPath } from "../helpers";

describe("isAdminOnlySettingsPath", () => {
  it("flags an admin-only top-level path", () => {
    expect(isAdminOnlySettingsPath("/settings/members")).toBe(true);
  });

  it("flags admin-only advanced paths", () => {
    expect(isAdminOnlySettingsPath("/settings/integrations")).toBe(true);
    expect(isAdminOnlySettingsPath("/settings/engine")).toBe(true);
    expect(isAdminOnlySettingsPath("/settings/jobs")).toBe(true);
    expect(isAdminOnlySettingsPath("/settings/logs")).toBe(true);
  });

  it("matches nested routes under an admin-only path", () => {
    expect(isAdminOnlySettingsPath("/settings/integrations/plex")).toBe(true);
  });

  it("does not flag non-admin paths", () => {
    expect(isAdminOnlySettingsPath("/settings/general")).toBe(false);
    expect(isAdminOnlySettingsPath("/settings/profile")).toBe(false);
    expect(isAdminOnlySettingsPath("/settings/updates")).toBe(false);
  });

  it("does not match a path that merely shares a prefix string", () => {
    expect(isAdminOnlySettingsPath("/settings/membersxyz")).toBe(false);
  });
});
