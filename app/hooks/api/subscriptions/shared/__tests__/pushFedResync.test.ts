import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi, beforeEach } from "vitest";

import { trpc } from "@utils/trpc";

import { resyncPushFedQueries } from "../pushFedResync";

const recorder = vi.hoisted(() => {
  const invalidated: string[] = [];

  const probe = (trail: string[]): unknown =>
    new Proxy(() => undefined, {
      get: (_target, key) => (typeof key === "string" ? probe([...trail, key]) : undefined),
      apply: () => {
        invalidated.push(trail.slice(0, -1).join("."));
      },
    });

  return { invalidated, probe };
});

vi.mock("@utils/trpc", () => ({
  trpc: { useUtils: () => recorder.probe([]) },
}));

const SUBSCRIPTIONS_DIR = join(process.cwd(), "app", "hooks", "api", "subscriptions");

const CACHE_WRITE = /utils\.([A-Za-z0-9_.]+)\.(?:invalidate|setData)\(/g;

function subscriptionSources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : subscriptionSources(full);
    if (!entry.name.endsWith(".ts") || entry.name === "pushFedResync.ts") return [];
    return [full];
  });
}

function pushFedQueryPaths(): string[] {
  const found = new Set<string>();
  for (const file of subscriptionSources(SUBSCRIPTIONS_DIR)) {
    for (const match of readFileSync(file, "utf8").matchAll(CACHE_WRITE)) {
      found.add(match[1]);
    }
  }
  return [...found].sort();
}

function resyncedQueryPaths(): string[] {
  resyncPushFedQueries(trpc.useUtils());
  return [...new Set(recorder.invalidated)].sort();
}

beforeEach(() => {
  recorder.invalidated.length = 0;
});

describe("resyncPushFedQueries", () => {
  it("invalidates the library views through the shared helper", () => {
    expect(resyncedQueryPaths()).toEqual(
      expect.arrayContaining([
        "library.getAlbums",
        "library.getArtists",
        "library.getPlaylists",
        "library.getTracks",
        "library.getCounts",
      ])
    );
  });

  it("covers every query the event handlers write to, so no surface is left without recovery", () => {
    const handlerWrites = pushFedQueryPaths();

    expect(handlerWrites.length).toBeGreaterThan(5);
    expect(handlerWrites).toContain("requests.getAll");
    expect(handlerWrites).toContain("import.getBatch");
    expect(resyncedQueryPaths()).toEqual(expect.arrayContaining(handlerWrites));
  });
});
