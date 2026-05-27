"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecentRequests } from "../../hooks/useRecentRequests";
import { RecentRequestCard } from "./RecentRequestCard";
import { RecentRequestsSkeleton } from "./RecentRequestsSkeleton";
import {
  headerLink,
  headerRow,
  sectionFrame,
  stripCard,
  stripEdgeBase,
  stripEdgeButton,
  stripFrame,
  stripScroller,
} from "./styles";

export function RecentRequests() {
  const router = useRouter();
  const { recent, isLoading, isError, limit } = useRecentRequests();

  const handleOpenRequests = () => {
    router.push("/requests");
  };

  if (isLoading) {
    return (
      <section className={sectionFrame()}>
        <Header onOpen={handleOpenRequests} limit={limit} />
        <RecentRequestsSkeleton />
      </section>
    );
  }

  if (isError) {
    return (
      <section className={sectionFrame()}>
        <Header onOpen={handleOpenRequests} limit={limit} />
        <EmptyState
          icon={AlertCircle}
          title="Failed to load requests"
          description="Unable to fetch recent requests. Please try again."
        />
      </section>
    );
  }

  if (recent.length === 0) {
    return (
      <section className={sectionFrame()}>
        <Header onOpen={handleOpenRequests} limit={limit} />
        <EmptyState
          icon={Download}
          title="No requests yet"
          description="Start requesting music to see your recent downloads here."
        />
      </section>
    );
  }

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={sectionFrame()}
      aria-label="Recent requests"
    >
      <Header onOpen={handleOpenRequests} limit={limit} />
      <Strip items={recent} />
    </motion.section>
  );
}

interface HeaderProps {
  onOpen: () => void;
  limit: number;
}

function Header({ onOpen, limit }: HeaderProps) {
  return (
    <div className={headerRow()}>
      <div>
        <h3 className="text-fg text-lg font-semibold">Recent requests</h3>
        <p className="text-fg/60 text-xs">{`Last ${limit} downloads`}</p>
      </div>
      <button type="button" onClick={onOpen} aria-label="Open requests page" className={headerLink()}>
        Open Requests <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

interface StripProps {
  items: ReturnType<typeof useRecentRequests>["recent"];
}

function Strip({ items }: StripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateAffordances = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateAffordances();

    el.addEventListener("scroll", updateAffordances, { passive: true });
    const observer = new ResizeObserver(updateAffordances);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));

    return () => {
      el.removeEventListener("scroll", updateAffordances);
      observer.disconnect();
    };
  }, [updateAffordances, items.length]);

  const scrollByOne = useCallback((direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.firstElementChild;
    const step = first instanceof HTMLElement ? first.offsetWidth : el.clientWidth;
    el.scrollBy({ left: direction === "right" ? step : -step, behavior: "smooth" });
  }, []);

  return (
    <div className={stripFrame()}>
      <div ref={scrollerRef} className={stripScroller()}>
        {items.map((request) => (
          <div key={request.id} className={stripCard()}>
            <RecentRequestCard request={request} />
          </div>
        ))}
      </div>

      <div className={stripEdgeBase({ side: "left", visible: canScrollLeft })} aria-hidden={!canScrollLeft}>
        <button
          type="button"
          onClick={() => scrollByOne("left")}
          aria-label="Scroll to previous requests"
          disabled={!canScrollLeft}
          className={stripEdgeButton()}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className={stripEdgeBase({ side: "right", visible: canScrollRight })} aria-hidden={!canScrollRight}>
        <button
          type="button"
          onClick={() => scrollByOne("right")}
          aria-label="Scroll to next requests"
          disabled={!canScrollRight}
          className={stripEdgeButton()}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
