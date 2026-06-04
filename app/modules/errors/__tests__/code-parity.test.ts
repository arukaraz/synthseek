import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import enErrors from "@locale/messages/en/errors.json";
import esErrors from "@locale/messages/es/errors.json";

/**
 * Anti-drift gate: the server is the source of truth for appCodes
 * (server/utils/errors/app-codes.ts). Every code it can emit MUST have a
 * translatable entry in the FE errors catalog (en + es), or a server error
 * would surface untranslated. Read the server source rather than import it to
 * avoid coupling the web test to the server runtime.
 */
function serverAppCodes(): string[] {
  const src = readFileSync(resolve(process.cwd(), "../server/utils/errors/app-codes.ts"), "utf8");
  const start = src.indexOf("APP_ERROR_CODES");
  const end = src.indexOf("} as const", start);
  const block = src.slice(start, end);
  return [...block.matchAll(/([A-Z][A-Z0-9_]+):\s*"[A-Z0-9_]+"/g)].map((match) => match[1]);
}

describe("appCode parity (server -> FE errors catalog)", () => {
  const codes = serverAppCodes();

  it("extracts a non-trivial server appCode list", () => {
    expect(codes.length).toBeGreaterThan(30);
  });

  for (const code of codes) {
    it(`errors.${code} exists in en and es`, () => {
      expect(Object.prototype.hasOwnProperty.call(enErrors, code), `missing en errors.${code}`).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(esErrors, code), `missing es errors.${code}`).toBe(true);
    });
  }
});
