"use client";

import { pathCellEmpty, pathCellText } from "../styles";
import type { TrackLibraryPathCellProps } from "./types";

export function TrackLibraryPathCell({ libraryPath }: TrackLibraryPathCellProps) {
  if (libraryPath === null) {
    return <span className={pathCellEmpty()}>--</span>;
  }
  return (
    <span className={pathCellText()} title={libraryPath.label}>
      {libraryPath.label}
    </span>
  );
}
