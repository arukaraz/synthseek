import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { SECRET_SENTINEL } from "../constants";

const serverSettingsConstantsPath = resolve(process.cwd(), "../server/utils/constants/settings.ts");
const serverSourcePresent = existsSync(serverSettingsConstantsPath);

describe.skipIf(!serverSourcePresent)("secret sentinel parity (web <-> server)", () => {
  it("recognises exactly the mask the server puts in place of a saved secret", () => {
    expect(readFileSync(serverSettingsConstantsPath, "utf8")).toContain(`SECRET_SENTINEL: "${SECRET_SENTINEL}"`);
  });
});

describe.runIf(!serverSourcePresent)("secret sentinel parity (web <-> server)", () => {
  it.skip("parity skipped: server source unavailable in standalone web CI", () => {
    expect(serverSourcePresent).toBe(false);
  });
});
