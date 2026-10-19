"use client";

import { ArrowRight, History } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { artworkProxySrc } from "@utils/artworkProxy";
import { getContentTypeIcon } from "@utils/content-type-helpers";

import { optionText } from "../helpers";
import { kbd, optionRow, optionSubtitle, optionTextColumn, optionTitle, optionVisual } from "../styles";
import type { OmniOptionRowProps } from "../types";

export function OmniOptionRow({ option, id, highlighted, onSelect, onHover }: OmniOptionRowProps) {
  const { t } = useTranslation("components");
  const text = optionText(option);
  const ResultIcon = option.kind === "result" ? getContentTypeIcon(option.type) : null;
  const GotoIcon = option.kind === "goto" ? option.icon : null;

  return (
    <li
      id={id}
      role="option"
      aria-selected={highlighted}
      className={optionRow({ highlighted, separated: option.kind === "seeAll" })}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={onHover}
      onClick={onSelect}
    >
      <span className={optionVisual()} aria-hidden>
        {option.kind === "result" && option.image ? (
          <Image src={artworkProxySrc(option.image)} alt="" fill sizes="32px" className="object-cover" unoptimized />
        ) : ResultIcon ? (
          <ResultIcon />
        ) : GotoIcon ? (
          <GotoIcon />
        ) : option.kind === "recent" ? (
          <History />
        ) : (
          <ArrowRight />
        )}
      </span>
      <span className={optionTextColumn()}>
        <span className={optionTitle()}>{text.title}</span>
        {text.subtitle ? <span className={optionSubtitle()}>{text.subtitle}</span> : null}
      </span>
      {highlighted ? <span className={kbd()}>{t("header.omni.keyEnter")}</span> : <span />}
    </li>
  );
}
