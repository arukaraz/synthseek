"use client";

import { useTranslation } from "react-i18next";

import { ArtistSpotlight } from "../../components/ArtistSpotlight/ArtistSpotlight";
import { CategoriesGrid } from "../../components/CategoriesGrid/CategoriesGrid";
import { DiscoveryMixes } from "../../components/DiscoveryMixes";
import { LibraryLeaderboard } from "../../components/LibraryLeaderboard/LibraryLeaderboard";
import { RecentRequests } from "../../components/RecentRequests/RecentRequests";
import { RecentScrobbles } from "../../components/RecentScrobbles";
import { TopTracks } from "../../components/TopTracks";
import { TrendingHero } from "../../components/TrendingHero/TrendingHero";
import { genresFill, middleColumn, middleRegion, pageStack, scrollRegion, srOnlyHeading, topRegion } from "./styles";

export function DiscoverScreen() {
  const { t } = useTranslation("discover");

  return (
    <div className={scrollRegion()}>
      <div className={pageStack()}>
        <h1 className={srOnlyHeading()}>{t("screen.srHeading")}</h1>

        <div className={topRegion()}>
          <TrendingHero />
          <LibraryLeaderboard />
        </div>

        <div className={middleRegion()}>
          <div className={middleColumn()}>
            <DiscoveryMixes />
            <ArtistSpotlight />
            <RecentScrobbles />
          </div>
          <div className={middleColumn()}>
            <TopTracks />
            <div className={genresFill()}>
              <CategoriesGrid />
            </div>
          </div>
        </div>

        <RecentRequests />
      </div>
    </div>
  );
}
