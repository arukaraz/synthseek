import type { WhatsNewEntry } from "../types";

export function makeWhatsNewEntry(overrides: Partial<WhatsNewEntry> = {}): WhatsNewEntry {
  return {
    version: "3.0.0",
    date: "2026-11-28",
    type: "major",
    title: "A whole new Synthseek",
    highlights: [
      { title: "The Stage", body: "Your music, full screen.", link: "/library" },
      { title: "Presets for requests", body: "Save how you like to request." },
    ],
    callouts: [{ level: "note", body: "Search rebuilds its index once after updating." }],
    sections: [{ heading: "Fixes", category: "fix", items: ["The queue keeps its order after a restart."] }],
    ...overrides,
  };
}
