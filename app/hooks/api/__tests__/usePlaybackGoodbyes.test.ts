import { describe, expect, it, vi } from "vitest";

const captured = vi.hoisted(() => ({ forget: null as unknown, publish: null as unknown }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    playback: {
      forgetDevice: {
        useMutation: (options: unknown) => {
          captured.forget = options;
          return { mutate: vi.fn() };
        },
      },
      publishState: {
        useMutation: (options: unknown) => {
          captured.publish = options;
          return { mutate: vi.fn() };
        },
      },
    },
  },
}));

import { useForgetDevice } from "../mutations/playback/useForgetDevice";
import { usePublishPlaybackState } from "../mutations/playback/usePublishPlaybackState";

describe("the goodbyes a closing tab sends", () => {
  it("ask to outlive the page, so a tab that closes still deregisters and stops being mirrored", () => {
    useForgetDevice();
    usePublishPlaybackState();

    expect(captured.forget).toEqual({ trpc: { context: { outliveThePage: true } } });
    expect(captured.publish).toEqual({ trpc: { context: { outliveThePage: true } } });
  });
});
