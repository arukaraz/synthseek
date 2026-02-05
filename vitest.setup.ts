import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { config } from "dotenv";

config();

afterEach(() => {
  cleanup();
});

expect.extend({});
