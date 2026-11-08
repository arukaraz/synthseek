import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { ALPHABET_INDEX_LETTERS } from "../constants";

const serverLibraryHelpersPath = resolve(process.cwd(), "../server/services/library/helpers.ts");
const serverSourcePresent = existsSync(serverLibraryHelpersPath);

function serverIndexLetters(): string[] {
  const source = readFileSync(serverLibraryHelpersPath, "utf8");
  const other = /INDEX_OTHER_LETTER\s*=\s*"([^"]+)"/.exec(source)?.[1];
  const letters = /INDEX_LETTERS[^=]*=\s*\[\.\.\."([^"]+)"\]/.exec(source)?.[1];
  return other === undefined || letters === undefined ? [] : [other, ...letters];
}

describe.skipIf(!serverSourcePresent)("alphabet index letters parity (web <-> server)", () => {
  it("shows exactly the letters the server's artist letter index can return", () => {
    expect(serverIndexLetters()).toEqual(ALPHABET_INDEX_LETTERS);
  });
});

describe.runIf(!serverSourcePresent)("alphabet index letters parity (web <-> server)", () => {
  it.skip("parity skipped: server source unavailable in standalone web CI", () => {
    expect(serverSourcePresent).toBe(false);
  });
});
