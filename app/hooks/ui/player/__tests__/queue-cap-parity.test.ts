import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { MAX_QUEUE_TRACKS } from "../constants";

const serverPlaybackConstantsPath = resolve(process.cwd(), "../server/utils/constants/playback.ts");
const serverSourcePresent = existsSync(serverPlaybackConstantsPath);

function serverQueueCap(): number | null {
  const literal = /MAX_QUEUE_SIZE:\s*([\d_]+)/.exec(readFileSync(serverPlaybackConstantsPath, "utf8"))?.[1];
  return literal === undefined ? null : Number(literal.replaceAll("_", ""));
}

describe.skipIf(!serverSourcePresent)("queue cap parity (web <-> server)", () => {
  it("holds exactly as many tracks as the server's saved session accepts", () => {
    expect(serverQueueCap()).toBe(MAX_QUEUE_TRACKS);
  });
});

describe.runIf(!serverSourcePresent)("queue cap parity (web <-> server)", () => {
  it.skip("parity skipped: server source unavailable in standalone web CI", () => {
    expect(serverSourcePresent).toBe(false);
  });
});
