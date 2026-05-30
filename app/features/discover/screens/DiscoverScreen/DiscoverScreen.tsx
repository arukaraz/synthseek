"use client";

import { ArtistSpotlight } from "../../components/ArtistSpotlight/ArtistSpotlight";
import { CategoriesGrid } from "../../components/CategoriesGrid/CategoriesGrid";
import { DiscoveryMixes } from "../../components/DiscoveryMixes";
import { LibraryLeaderboard } from "../../components/LibraryLeaderboard/LibraryLeaderboard";
import { RecentRequests } from "../../components/RecentRequests/RecentRequests";
import { RecentScrobbles } from "../../components/RecentScrobbles";
import { TopTracks } from "../../components/TopTracks";
import { TrendingHero } from "../../components/TrendingHero/TrendingHero";

export function DiscoverScreen() {
  return (
    <div className="custom-scrollbar relative h-full overflow-auto">
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="flex min-w-0 flex-col gap-6">
            <TrendingHero />
            <DiscoveryMixes />
          </div>
          <div className="flex min-w-0 flex-col gap-6">
            <LibraryLeaderboard />
            <TopTracks />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex min-w-0 flex-col gap-6">
            <ArtistSpotlight />
            <RecentRequests />
          </div>
          <CategoriesGrid />
        </div>

        <RecentScrobbles />
      </div>
    </div>
  );
}
