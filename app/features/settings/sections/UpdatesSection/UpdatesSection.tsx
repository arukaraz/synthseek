"use client";

import { PatchNotesTimeline } from "./PatchNotesTimeline";
import { UpdatesHeader } from "./UpdatesHeader";
import { pageRoot } from "./styles";

export function UpdatesSection() {
  return (
    <div className={pageRoot()}>
      <UpdatesHeader />
      <PatchNotesTimeline />
    </div>
  );
}
