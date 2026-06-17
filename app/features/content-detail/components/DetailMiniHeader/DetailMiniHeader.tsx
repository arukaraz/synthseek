"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";

import { detailInitials } from "../../helpers";
import { miniBack, miniBar, miniImage, miniInitials, miniName, miniStickyRoot, miniThumb } from "../../styles";
import type { DetailMiniHeaderProps } from "./types";

export function DetailMiniHeader({
  name,
  cover,
  mode,
  canGoBack,
  onBack,
  backAriaLabel,
  visible,
}: DetailMiniHeaderProps) {
  return (
    <div className={miniStickyRoot()}>
      <div className={miniBar({ visible })} aria-hidden={!visible}>
        {canGoBack ? (
          <button type="button" className={miniBack()} aria-label={backAriaLabel} onClick={onBack}>
            <ArrowLeft className="size-5" aria-hidden />
          </button>
        ) : null}

        <div className={miniThumb({ shape: mode === "artist" ? "round" : "square" })}>
          {cover ? (
            <Image src={cover} alt="" fill sizes="36px" className={miniImage()} />
          ) : (
            <span aria-hidden className={miniInitials()}>
              {detailInitials(name)}
            </span>
          )}
        </div>

        <span className={miniName()}>{name}</span>
      </div>
    </div>
  );
}
