"use client";

import { useTrendingTracks } from "@hooks/api/queries/useTrendingTracks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArtistSpotlight } from "../components/ArtistSpotlight/ArtistSpotlight";
import { CategoriesGrid } from "../components/CategoriesGrid/CategoriesGrid";
import { CoverflowCarousel } from "../components/CoverflowCarousel/CoverflowCarousel";
import { LastRequests } from "../components/LastRequests/LastRequests";
import { NowListening } from "../components/NowListening/NowListening";
import { YourLibrary } from "../components/YourLibrary/YourLibrary";
import { sidebarContainer } from "../components/styles";

const AUTO_ROTATE_INTERVAL = 10000;

export function DiscoverView() {
  const { data, isLoading, isError } = useTrendingTracks();

  const tracks = useMemo(() => data?.data?.tracks ?? [], [data?.data?.tracks]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || tracks.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tracks.length);
    }, AUTO_ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isAutoPlaying, tracks.length]);

  useEffect(() => {
    if (tracks.length > 0) {
      setCurrentIndex(Math.floor(tracks.length / 2));
    }
  }, [tracks]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  }, [tracks.length]);

  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div className="custom-scrollbar relative h-full overflow-auto">
      <div className="relative">
        <CoverflowCarousel
          currentIndex={currentIndex}
          tracks={tracks}
          setIsAutoPlaying={setIsAutoPlaying}
          onPrev={handlePrev}
          onNext={handleNext}
          onIndexChange={handleIndexChange}
          isLoading={isLoading}
          isError={isError}
        />

        <div className="glass-panel-dark p-6">
          <div className="relative flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-col gap-6 lg:w-[70%]">
              <ArtistSpotlight />
              <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
                <div className="md:w-[30%]">
                  <CategoriesGrid />
                </div>
                <div className="flex md:w-[70%]">
                  <YourLibrary />
                </div>
              </div>
            </div>

            <div className={sidebarContainer()}>
              <div className="min-h-0 flex-3">
                <NowListening />
              </div>
              <div className="min-h-0 flex-7">
                <LastRequests />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
