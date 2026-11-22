"use client";

import { AudioAnalysisCard } from "./AudioAnalysisCard";
import { CoverArtCard } from "./CoverArtCard";
import { EditionsCard } from "./EditionsCard";
import { LibraryScanCard } from "./LibraryScanCard";

export function LibraryScanSection() {
  return (
    <>
      <LibraryScanCard />
      <CoverArtCard />
      <EditionsCard />
      <AudioAnalysisCard />
    </>
  );
}
