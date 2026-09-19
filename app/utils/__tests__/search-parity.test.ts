import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { foldText, matchesTerms, searchTerms } from "../search";

const serverNormalizationPath = resolve(process.cwd(), "../server/utils/helpers/string/normalization.ts");
const serverSourcePresent = existsSync(serverNormalizationPath);

function serverSource(): string {
  return readFileSync(serverNormalizationPath, "utf8");
}

function foldSteps(source: string, from: string): string[] {
  const start = source.indexOf(from);
  const end = source.indexOf("}", start);
  return source
    .slice(start, end)
    .split("\n")
    .map((line) => line.trim().replace(/;$/, ""))
    .filter((line) => line.startsWith("."));
}

function serverFoldSteps(): string[] {
  return foldSteps(serverSource(), "export function foldForSearch");
}

function clientFoldSteps(): string[] {
  const src = readFileSync(resolve(process.cwd(), "app/utils/search.ts"), "utf8");
  return foldSteps(src, "const folded = value");
}

describe.skipIf(!serverSourcePresent)("search fold parity (web <-> server)", () => {
  it("finds a server fold to compare against", () => {
    expect(serverFoldSteps().length).toBeGreaterThan(3);
  });

  it("applies the same fold steps in the same order on both sides", () => {
    expect(serverFoldSteps().map((step) => step.replace(/SEARCH_/g, ""))).toEqual(clientFoldSteps());
  });

  it("carries the same standalone-letter map on both sides", () => {
    const serverPairs = [...serverSource().matchAll(/\["(.)", "([a-z]+)"\]/g)].map((m) => `${m[1]}=${m[2]}`);
    const clientSource = readFileSync(resolve(process.cwd(), "app/utils/search.ts"), "utf8");
    const clientPairs = [...clientSource.matchAll(/\["(.)", "([a-z]+)"\]/g)].map((m) => `${m[1]}=${m[2]}`);

    expect(serverPairs.length).toBeGreaterThan(5);
    expect(serverPairs).toEqual(clientPairs);
  });

  it("agrees on the folds a reader of the requests search box would notice", () => {
    expect(foldText("México")).toBe("mexico");
    expect(foldText("AC/DC")).toBe("acdc");
    expect(foldText("Don't Stop")).toBe("dont stop");
    expect(foldText("Panic! At The Disco")).toBe("panic at the disco");
  });

  it("matches the same way whichever half of the requests box answers", () => {
    expect(matchesTerms(searchTerms("acdc"), ["AC/DC"])).toBe(true);
    expect(matchesTerms(searchTerms("punk daft"), ["Daft Punk"])).toBe(true);
  });
});
