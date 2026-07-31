"use client";

import { Search, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DropImportFileStatus } from "@api/__generated__/types";
import { IconButton } from "@components/ui/IconButton";
import { useDiscardDropImportFile } from "@hooks/api";

import { fileDisplayTags } from "../helpers";
import { fileActions, fileError, fileInfo, fileMeta, fileName, fileRow } from "../styles";
import type { FileRowProps } from "../types";
import { FileStatusBadge } from "./FileStatusBadge";

export function FileRow({ file, isMatchOpen, onToggleMatch }: FileRowProps) {
  const { t } = useTranslation("library");
  const discard = useDiscardDropImportFile();

  const isPendingMatch = file.status === DropImportFileStatus.enum.pending_match;
  const tags = fileDisplayTags(file);

  return (
    <div className={fileRow()} data-status={file.status}>
      <div className={fileInfo()}>
        <span className={fileName()} title={file.original_name}>
          {file.original_name}
        </span>
        {tags ? <span className={fileMeta()}>{tags}</span> : null}
        {file.error ? <span className={fileError()}>{file.error}</span> : null}
      </div>

      <div className={fileActions()}>
        <FileStatusBadge file={file} />
        {isPendingMatch ? (
          <>
            <IconButton
              icon={Search}
              size="sm"
              aria-label={t("dropImport.match.findAria", { name: file.original_name })}
              aria-expanded={isMatchOpen}
              onClick={onToggleMatch}
            />
            <IconButton
              icon={Trash2}
              size="sm"
              aria-label={t("dropImport.match.discardAria", { name: file.original_name })}
              onClick={() => discard.mutate({ fileId: file.id })}
              disabled={discard.isPending}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
