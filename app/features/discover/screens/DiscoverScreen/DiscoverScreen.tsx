"use client";

import { useTranslation } from "react-i18next";

import { ExploreBoard } from "../../components/ExploreBoard/ExploreBoard";
import { pageStack, scrollRegion, srOnlyHeading } from "./styles";

export function DiscoverScreen() {
  const { t } = useTranslation("discover");

  return (
    <div className={scrollRegion()}>
      <div className={pageStack()}>
        <h1 className={srOnlyHeading()}>{t("screen.srHeading")}</h1>
        <ExploreBoard />
      </div>
    </div>
  );
}
