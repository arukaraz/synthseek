"use client";

import { useTranslation } from "react-i18next";

import { OMNI_LIST_ID } from "../constants";
import { optionId } from "../helpers";
import { dropdownFooter, footerHint, groupLabel, kbd, noMatches, optionList } from "../styles";
import type { OmniDropdownProps, OmniOption } from "../types";
import { OmniOptionRow } from "./OmniOptionRow";
import { OmniScopes } from "./OmniScopes";

export function OmniDropdown({ omni, options, onSelect }: OmniDropdownProps) {
  const { t } = useTranslation("components");
  const query = omni.draft.trim();
  const head = options.filter((option) => option.kind !== "goto");
  const gotos = options.filter((option) => option.kind === "goto");
  const hasResults = head.some((option) => option.kind === "result");
  const headLabel = query ? t("header.omni.results") : t("header.omni.recent");

  const rows = (list: OmniOption[], offset: number) =>
    list.map((option, index) => (
      <OmniOptionRow
        key={option.key}
        option={option}
        id={optionId(offset + index)}
        highlighted={omni.highlighted === offset + index}
        onSelect={() => onSelect(option)}
        onHover={() => omni.highlight(offset + index)}
      />
    ));

  return (
    <div>
      <OmniScopes layout="row" value={omni.scope} onChange={omni.changeScope} />
      <div role="listbox" id={OMNI_LIST_ID} aria-label={t("header.search")}>
        {head.length > 0 ? (
          <ul role="group" aria-label={headLabel} className={optionList()}>
            <li role="presentation" className={groupLabel()}>
              {headLabel}
            </li>
            {query && !hasResults ? (
              <li role="presentation" className={noMatches()}>
                {t("header.omni.noMatches", { query })} {t("header.omni.noMatchesHint")}
              </li>
            ) : null}
            {rows(head, 0)}
          </ul>
        ) : null}
        <ul role="group" aria-label={t("header.omni.goTo")} className={optionList()}>
          <li role="presentation" className={groupLabel()}>
            {t("header.omni.goTo")}
          </li>
          {rows(gotos, head.length)}
        </ul>
      </div>
      <div className={dropdownFooter()} aria-hidden>
        <span className={footerHint()}>
          <kbd className={kbd()}>{t("header.omni.keyEnter")}</kbd>
          {t("header.omni.hintOpen")}
        </span>
        <span className={footerHint()}>
          <kbd className={kbd()}>{t("header.omni.keyTab")}</kbd>
          {t("header.omni.hintScope")}
        </span>
        <span className={footerHint()}>
          <kbd className={kbd()}>{t("header.omni.keyEsc")}</kbd>
          {t("header.omni.hintClose")}
        </span>
      </div>
    </div>
  );
}
