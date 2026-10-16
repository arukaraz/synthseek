import { Loader2, Play } from "lucide-react";

import type { ColumnDef } from "@components/ui/Table";

import { jobPlayButton, scanCount, scanLastRun, scanPathCell, scanPathFolder, scanPathLabel } from "../../styles";
import { lastScanOf } from "./helpers";
import type { LibraryScanPath, ScanPathColumnsArgs } from "./types";

export function buildScanPathColumns({ t, busy, onScan }: ScanPathColumnsArgs): ColumnDef<LibraryScanPath>[] {
  return [
    {
      key: "path",
      header: t("libraryScan.paths.columns.path"),
      cell: (path) => (
        <div className={scanPathCell()}>
          <span className={scanPathLabel()}>{path.label}</span>
          <span className={scanPathFolder()} title={path.folder}>
            {path.folder}
          </span>
        </div>
      ),
    },
    {
      key: "onDisk",
      header: t("libraryScan.stats.onDisk"),
      cell: (path) => <span className={scanCount()}>{path.indexedFiles.toLocaleString()}</span>,
    },
    {
      key: "linked",
      header: t("libraryScan.stats.linked"),
      cell: (path) => <span className={scanCount()}>{path.linkedFiles.toLocaleString()}</span>,
    },
    {
      key: "searching",
      header: t("libraryScan.stats.searching"),
      cell: (path) => <span className={scanCount()}>{path.searchingFiles.toLocaleString()}</span>,
      className: "max-md:hidden",
    },
    {
      key: "review",
      header: t("libraryScan.stats.toReview"),
      cell: (path) => (
        <span className={scanCount({ tone: path.reviewFiles > 0 ? "attention" : "plain" })}>
          {path.reviewFiles.toLocaleString()}
        </span>
      ),
      className: "max-md:hidden",
    },
    {
      key: "gone",
      header: t("libraryScan.paths.columns.gone"),
      cell: (path) => (
        <span className={scanCount({ tone: path.missingFiles > 0 ? "danger" : "plain" })}>
          {path.missingFiles.toLocaleString()}
        </span>
      ),
      className: "max-md:hidden",
    },
    {
      key: "lastScan",
      header: t("libraryScan.paths.columns.lastScan"),
      cell: (path) => {
        const last = lastScanOf(path, t);
        return <span className={scanLastRun({ skipped: last.skipped })}>{last.text}</span>;
      },
      className: "max-md:hidden",
    },
    {
      key: "scan",
      header: <span className="sr-only">{t("libraryScan.paths.columns.scan")}</span>,
      cell: (path) => (
        <button
          type="button"
          className={jobPlayButton()}
          onClick={() => onScan(path)}
          disabled={busy || !path.enabled}
          aria-label={t("libraryScan.paths.scan", { label: path.label })}
          aria-busy={path.scanning}
        >
          {path.scanning ? <Loader2 className="animate-spin" /> : <Play className="fill-current" />}
        </button>
      ),
      className: "w-12",
    },
  ];
}
