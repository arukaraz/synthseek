"use client";

import { AudioAnalysisCard } from "./AudioAnalysisCard";
import { CoverArtCard } from "./CoverArtCard";
import { EditionsCard } from "./EditionsCard";
import { LibraryPathsCard } from "./LibraryPathsCard";
import { LibraryRulesCard } from "./LibraryRulesCard";

export function LibrarySection() {
  return (
    <>
      <LibraryPathsCard />
      <LibraryRulesCard />
      <EditionsCard />
      <AudioAnalysisCard />
      <CoverArtCard />
    </>
  );
}
