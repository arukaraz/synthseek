"use client";

import { Notice } from "@components/ui/Notice";
import { Spinner } from "@components/ui/Spinner";
import { Check } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import { pathOptionDetail, pathOptionState } from "./helpers";
import {
  pathField,
  pathFieldLabel,
  pathList,
  pathOption,
  pathOptionCheck,
  pathOptionDetail as pathOptionDetailStyle,
  pathOptionLabel,
  previewPending,
} from "./styles";
import type { MovePathOptionsProps } from "./types";

export function MovePathOptions({
  paths,
  isLoading,
  isError,
  sourcePathIds,
  selected,
  onSelect,
}: MovePathOptionsProps) {
  const { t } = useTranslation("library");
  const labelId = useId();

  if (isLoading) {
    return (
      <div className={previewPending()}>
        <Spinner size="sm" label={t("files.move.loadingPaths")} />
      </div>
    );
  }

  if (isError || paths === undefined) {
    return <Notice variant="danger" title={t("files.move.pathsFailed")} />;
  }

  const options = paths.map((path) => ({ path, state: pathOptionState(path, sourcePathIds) }));
  const anyAvailable = options.some((option) => option.state === "available");

  return (
    <div className={pathField()}>
      <p id={labelId} className={pathFieldLabel()}>
        {t("files.move.to")}
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className={pathList()}>
        {options.map(({ path, state }) => {
          const active = path.id === selected;
          return (
            <button
              key={path.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={state !== "available"}
              className={pathOption({ active })}
              onClick={() => onSelect(path.id)}
            >
              <span className={pathOptionLabel()}>{path.label}</span>
              <span className={pathOptionDetailStyle()}>{pathOptionDetail(path, state)}</span>
              <Check className={pathOptionCheck({ active })} aria-hidden />
            </button>
          );
        })}
      </div>
      {anyAvailable ? null : <Notice variant="warning" title={t("files.move.noTarget")} />}
    </div>
  );
}
