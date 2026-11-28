import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";
import { createMockUser } from "@test/mocks/feature-hooks.mock";

import type { MemberListItem } from "../../types";

const api = vi.hoisted(() => ({
  members: [] as unknown[],
  unlink: vi.fn(),
  confirm: vi.fn(),
  error: null as unknown,
}));

vi.mock("@hooks/api/queries/useUsers", () => ({
  useUsers: () => ({ data: api.members }),
}));

vi.mock("@hooks/api/mutations/users/useMemberSignIn", () => ({
  useUnlinkMemberIdentity: () => ({ mutate: api.unlink, isPending: false, error: api.error }),
}));

vi.mock("@utils/confirm", () => ({
  confirm: (...args: unknown[]) => api.confirm(...args),
}));

import { MemberWaysIn } from "../MemberWaysIn";

const copy = enSettings.members.waysIn;

function withMember(member: MemberListItem) {
  api.members = [member];
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  api.error = null;
  api.confirm.mockResolvedValue(true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MemberWaysIn", () => {
  it("unlinks a member's outside account only after the admin confirms", async () => {
    withMember(
      createMockUser({
        id: "m1",
        username: "ana",
        hasPassword: true,
        signInIdentities: [{ id: "i1", provider: "oidc", displayName: "ana@auth" }],
      })
    );
    api.confirm.mockResolvedValueOnce(false);
    render(<MemberWaysIn memberId="m1" oidcLabel="Authentik" />);

    await userEvent.click(screen.getByLabelText("Unlink Authentik"));
    await waitFor(() => expect(api.confirm).toHaveBeenCalledTimes(1));
    expect(api.unlink).not.toHaveBeenCalled();

    await userEvent.click(screen.getByLabelText("Unlink Authentik"));
    await waitFor(() => expect(api.unlink).toHaveBeenCalledWith({ userId: "m1", identityId: "i1" }));
  });

  it("refuses to offer the last way in, and says why", () => {
    withMember(
      createMockUser({
        id: "m1",
        hasPassword: false,
        signInIdentities: [{ id: "i1", provider: "jellyfin", displayName: "ana" }],
      })
    );

    render(<MemberWaysIn memberId="m1" oidcLabel="Authentik" />);

    expect(screen.queryByLabelText("Unlink Jellyfin")).not.toBeInTheDocument();
    expect(screen.getByText(copy.lastWayIn)).toBeInTheDocument();
  });

  it("says so when nothing outside is linked", () => {
    withMember(createMockUser({ id: "m1", hasPassword: true, signInIdentities: [] }));

    render(<MemberWaysIn memberId="m1" oidcLabel="Authentik" />);

    expect(screen.getByText(copy.none)).toBeInTheDocument();
  });
});
