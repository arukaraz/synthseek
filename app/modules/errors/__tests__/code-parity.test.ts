import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import deErrors from "@locale/messages/de/errors.json";
import enErrors from "@locale/messages/en/errors.json";
import esErrors from "@locale/messages/es/errors.json";
import frErrors from "@locale/messages/fr/errors.json";

const serverAppCodesPath = resolve(process.cwd(), "../server/utils/errors/app-codes.ts");
const serverSourcePresent = existsSync(serverAppCodesPath);

function serverAppCodes(): string[] {
  const src = readFileSync(serverAppCodesPath, "utf8");
  const start = src.indexOf("APP_ERROR_CODES");
  const end = src.indexOf("} as const", start);
  const block = src.slice(start, end);
  return [...block.matchAll(/([A-Z][A-Z0-9_]+):\s*"[A-Z0-9_]+"/g)].map((match) => match[1]);
}

describe.skipIf(!serverSourcePresent)("appCode parity (server -> FE errors catalog)", () => {
  const codes = serverSourcePresent ? serverAppCodes() : [];

  it("extracts a non-trivial server appCode list", () => {
    expect(codes.length).toBeGreaterThan(30);
  });

  for (const code of codes) {
    it(`errors.${code} exists in en, es, de, and fr`, () => {
      expect(Object.prototype.hasOwnProperty.call(enErrors, code), `missing en errors.${code}`).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(esErrors, code), `missing es errors.${code}`).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(deErrors, code), `missing de errors.${code}`).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(frErrors, code), `missing fr errors.${code}`).toBe(true);
    });
  }
});

describe.runIf(!serverSourcePresent)("appCode parity (server -> FE errors catalog)", () => {
  it.skip("parity skipped: server source unavailable in standalone web CI", () => {
    expect(serverSourcePresent).toBe(false);
  });
});
