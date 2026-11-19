"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { inlineLink } from "@components/HashLink";
import { useFollowedTotal } from "@hooks/api/queries/artist-follow/useFollowedTotal";

import { FOLLOWING_HREF } from "./constants";

export function FollowEmptyNote() {
  const { t } = useTranslation("follows");
  const total = useFollowedTotal();

  if (total === 0) {
    return (
      <span>
        {t("widget.emptyNone")}{" "}
        <Link href={FOLLOWING_HREF} className={inlineLink()}>
          {t("widget.emptyStart")}
        </Link>
      </span>
    );
  }

  return (
    <span>
      {t("widget.emptyRange")}{" "}
      <Link href={FOLLOWING_HREF} className={inlineLink()}>
        {t("following.tableLabel")}
      </Link>
    </span>
  );
}
