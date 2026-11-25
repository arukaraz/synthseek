"use client";

import { useTranslation } from "react-i18next";

import { HashLink, inlineLink } from "@components/HashLink";

import { SERVER_PRESET_HREF } from "../constants";
import {
  memberPresetFollow,
  memberPresetFollowLabel,
  memberPresetFollowLink,
  memberPresetFollowValue,
} from "../styles";
import type { MemberPresetFollowSummaryProps } from "../types";

export function MemberPresetFollowSummary({ summary, hasServerPreset }: MemberPresetFollowSummaryProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={memberPresetFollow()}>
      <span className={memberPresetFollowLabel()}>
        {hasServerPreset ? t("requestPreset.member.usingServer") : t("requestPreset.member.usingDefaults")}
      </span>
      <span className={memberPresetFollowValue()}>{summary}</span>
      <HashLink href={SERVER_PRESET_HREF} className={inlineLink({ className: memberPresetFollowLink() })}>
        {hasServerPreset ? t("requestPreset.member.editServerPreset") : t("requestPreset.member.chooseServerPreset")}
      </HashLink>
    </div>
  );
}
