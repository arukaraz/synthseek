"use client";

import { useTranslation } from "react-i18next";

import { memberSignInChips } from "../helpers";
import { pill, signInChips } from "../styles";
import type { MemberSignInCellProps } from "../types";

export function MemberSignInCell({ member, oidcLabel }: MemberSignInCellProps) {
  const { t } = useTranslation("settings");
  const chips = memberSignInChips(member, oidcLabel);

  if (chips.length === 0) return <span className={pill({ tone: "local" })}>{t("members.signsIn.none")}</span>;

  return (
    <ul className={signInChips()}>
      {chips.map((chip) => (
        <li key={chip.key} className={pill({ tone: "local" })}>
          {chip.label}
        </li>
      ))}
    </ul>
  );
}
