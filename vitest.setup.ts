import "@testing-library/jest-dom";
import "@locale";
import { expect, afterEach } from "vitest";
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

afterEach(() => {
  cleanup();
});

expect.extend({});
