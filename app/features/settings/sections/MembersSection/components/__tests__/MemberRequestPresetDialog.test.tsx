import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestPreset } from "@features/search/components/ConfigRequestModal/types";
import { createMockUser } from "@test/mocks/feature-hooks.mock";
import { renderWithProviders, screen } from "@test/test-utils";

import { MemberRequestPresetDialog } from "../MemberRequestPresetDialog";

const FACTORY: RequestPreset = {
  bitrate: { value: 320, matching: "flexible" },
  format: { value: "mp3", matching: "flexible" },
  minUploadSpeed: 0,
  requireFreeSlot: false,
};

const OWN: RequestPreset = { ...FACTORY, bitrate: { value: 256, matching: "strict" } };

const state = vi.hoisted(() => {
  const memberPreset: { current: RequestPreset | null | undefined } = { current: undefined };
  return { memberPreset, failed: { current: false }, mutate: vi.fn(), lastUserId: { current: "" } };
});

vi.mock("@hooks/api", () => ({
  useMemberRequestPreset: (userId: string | null) => {
    state.lastUserId.current = userId ?? "";
    return { data: state.memberPreset.current, isError: state.failed.current };
  },
  useMyRequestPreset: () => ({ data: { server: null, factory: FACTORY }, isError: false }),
  useSetMemberRequestPreset: () => ({ mutate: state.mutate, isPending: false }),
  useDownloadSourcesAvailability: () => ({
    data: {
      slskd: { enabled: true, allowsSingleTracks: true },
      ytdlp: { enabled: false, allowsSingleTracks: true },
      usenet: { enabled: false, allowsSingleTracks: false },
      archive: { enabled: false, allowsSingleTracks: true },
      soundcloud: { enabled: false, allowsSingleTracks: true },
      subsonic: { enabled: false, allowsSingleTracks: true },
      torrent: { enabled: false, allowsSingleTracks: false },
    },
    isPending: false,
  }),
}));

const member = { ...createMockUser({ id: "u-7", username: "sofia", role: "member" }), isOwner: false };

beforeEach(() => {
  state.mutate.mockReset();
  state.memberPreset.current = undefined;
  state.failed.current = false;
});

describe("MemberRequestPresetDialog", () => {
  it("renders nothing without a member", () => {
    renderWithProviders(<MemberRequestPresetDialog member={null} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("waits for the member's preset before offering to save", () => {
    renderWithProviders(<MemberRequestPresetDialog member={member} onClose={vi.fn()} />);

    expect(screen.getByText("Loading settings…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("says so when the member's preset cannot be loaded, instead of loading forever", () => {
    state.failed.current = true;
    renderWithProviders(<MemberRequestPresetDialog member={member} onClose={vi.fn()} />);

    expect(screen.getByText("This member's request preset could not be loaded. Try again later.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("opens on the member's own preset and saves the change for that member", async () => {
    state.memberPreset.current = OWN;
    const onClose = vi.fn();
    const { user } = renderWithProviders(<MemberRequestPresetDialog member={member} onClose={onClose} />);

    expect(state.lastUserId.current).toBe("u-7");
    expect(screen.getByRole("radio", { name: "Their own" })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: "Follow the server" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(state.mutate).toHaveBeenCalledWith({ userId: "u-7", preset: null }, { onSuccess: onClose });
  });

  it("says what following means when the server has no preset", () => {
    state.memberPreset.current = null;
    renderWithProviders(<MemberRequestPresetDialog member={member} onClose={vi.fn()} />);

    expect(screen.getByText(/There is no server preset/)).toBeInTheDocument();
  });
});
