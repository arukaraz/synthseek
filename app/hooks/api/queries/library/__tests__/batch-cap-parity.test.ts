import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { LIBRARY_BATCH_LIMIT_MAX } from "../constants";

const serverLibrarySchemaPath = resolve(process.cwd(), "../server/trpc/schemas/library.ts");
const serverSourcePresent = existsSync(serverLibrarySchemaPath);

function serverPageLimitMax(): number | null {
  const literal = /LIBRARY_PAGE_LIMIT_MAX\s*=\s*([\d_]+)/.exec(readFileSync(serverLibrarySchemaPath, "utf8"))?.[1];
  return literal === undefined ? null : Number(literal.replaceAll("_", ""));
}

describe.skipIf(!serverSourcePresent)("library batch cap parity (web <-> server)", () => {
  it("never asks for a bigger artists batch than the server's page limit accepts", () => {
    expect(serverPageLimitMax()).toBe(LIBRARY_BATCH_LIMIT_MAX);
  });
});

describe.runIf(!serverSourcePresent)("library batch cap parity (web <-> server)", () => {
  it.skip("parity skipped: server source unavailable in standalone web CI", () => {
    expect(serverSourcePresent).toBe(false);
  });
});
