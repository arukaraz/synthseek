import { beforeEach, describe, expect, it, vi } from "vitest";

import { announce } from "../announce";

const toast = vi.hoisted(() => ({ error: vi.fn(), warning: vi.fn(), info: vi.fn() }));

vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("announce", () => {
  it("raises a failure the listener has to see as an error", () => {
    announce({ text: "Skipping Digital Love", tone: "danger" });

    expect(toast.error).toHaveBeenCalledWith("Skipping Digital Love");
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("raises something the listener may need to act on as a warning", () => {
    announce({ text: "Autoplay was blocked", tone: "warning" });

    expect(toast.warning).toHaveBeenCalledWith("Autoplay was blocked");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("raises everything else quietly", () => {
    announce({ text: "Queue finished", tone: "info" });

    expect(toast.info).toHaveBeenCalledWith("Queue finished");
    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.warning).not.toHaveBeenCalled();
  });
});
