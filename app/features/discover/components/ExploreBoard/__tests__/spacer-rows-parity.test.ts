import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { SPACER_MAX_ROWS, SPACER_MIN_ROWS } from "../constants";

const serverConstantsPath = resolve(process.cwd(), "../server/utils/constants/board.ts");
const serverSchemaPath = resolve(process.cwd(), "../server/services/board/schema.ts");
const serverSourcePresent = existsSync(serverConstantsPath) && existsSync(serverSchemaPath);

function serverNumber(path: string, pattern: RegExp): number | null {
  const literal = pattern.exec(readFileSync(path, "utf8"))?.[1];
  return literal === undefined ? null : Number(literal);
}

describe.skipIf(!serverSourcePresent)("spacer rows parity (web <-> server)", () => {
  it("offers exactly the heights the server's schema accepts", () => {
    expect(serverNumber(serverConstantsPath, /SPACER_MAX_ROWS:\s*(\d+)/)).toBe(SPACER_MAX_ROWS);
    expect(serverNumber(serverSchemaPath, /SpacerRowsSchema = z\.number\(\)\.int\(\)\.min\((\d+)\)/)).toBe(
      SPACER_MIN_ROWS
    );
  });
});

describe.runIf(!serverSourcePresent)("spacer rows parity (web <-> server)", () => {
  it.skip("parity skipped: server source unavailable in standalone web CI", () => {
    expect(serverSourcePresent).toBe(false);
  });
});
