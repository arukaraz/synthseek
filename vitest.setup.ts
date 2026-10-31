import "@testing-library/jest-dom";
import "@locale";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { config } from "dotenv";

config();

class InertResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = InertResizeObserver;
}

afterEach(async () => {
  cleanup();
  if (!vi.isFakeTimers()) await new Promise((resolve) => setTimeout(resolve, 0));
});

expect.extend({});
