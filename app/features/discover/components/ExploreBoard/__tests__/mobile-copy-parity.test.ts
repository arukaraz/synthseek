import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { BoardItem } from "@hooks/api/queries/board/types";

import { MOBILE_COPY_SIZE } from "../constants";
import { mobileCopyOf } from "../helpers";

const serverConstantsPath = resolve(process.cwd(), "../server/utils/constants/board.ts");
const serverServicePath = resolve(process.cwd(), "../server/services/board/board-layout.service.ts");
const serverSourcePresent = existsSync(serverConstantsPath) && existsSync(serverServicePath);

function serverSource(path: string): string {
  return readFileSync(path, "utf8");
}

describe.skipIf(!serverSourcePresent)("mobile copy parity (web <-> server)", () => {
  it("copies every tile at the size the server copies it at", () => {
    expect(/MOBILE_COPY_SIZE:\s*"([SML])"/.exec(serverSource(serverConstantsPath))?.[1]).toBe(MOBILE_COPY_SIZE);
  });

  it("leaves out exactly the spacers the server leaves out", () => {
    expect(serverSource(serverServicePath)).toContain(
      '.filter((item) => item.kind !== "spacer" || item.background !== false)'
    );
    const bare: BoardItem = { kind: "spacer", id: "s", size: "S", rows: 2, background: false };
    const shown: BoardItem = { kind: "spacer", id: "t", size: "S", rows: 2 };
    const widget: BoardItem = { kind: "builtin", id: "w", widget: "mixes", size: "L", background: false };

    expect(mobileCopyOf([bare, shown, widget]).map((item) => item.id)).toEqual(["t", "w"]);
  });
});

describe.runIf(!serverSourcePresent)("mobile copy parity (web <-> server)", () => {
  it.skip("parity skipped: server source unavailable in standalone web CI", () => {
    expect(serverSourcePresent).toBe(false);
  });
});
