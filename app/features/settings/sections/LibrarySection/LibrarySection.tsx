"use client";

import { AudioAnalysisCard } from "./AudioAnalysisCard";
import { CoverArtCard } from "./CoverArtCard";
import { LibraryPathsCard } from "./LibraryPathsCard";
import { LibraryRulesCard } from "./LibraryRulesCard";

export function LibrarySection() {
  return (
    <>
      <LibraryPathsCard />
      <LibraryRulesCard />
      <AudioAnalysisCard />
      <CoverArtCard />
    </>
  );
}
