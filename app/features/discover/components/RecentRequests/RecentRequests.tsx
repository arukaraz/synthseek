"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRecentRequests } from "../../hooks/useRecentRequests";
import { RecentRequestsHeader } from "./RecentRequestsHeader";
import { RecentRequestsSkeleton } from "./RecentRequestsSkeleton";
import { RecentRequestsStrip } from "./RecentRequestsStrip";
import { sectionFrame } from "./styles";

export function RecentRequests() {
  const router = useRouter();
  const { recent, isLoading, isError, limit } = useRecentRequests();

  const handleOpenRequests = () => {
    router.push("/requests");
  };

  if (isLoading) {
    return (
      <section className={sectionFrame()}>
        <RecentRequestsHeader onOpen={handleOpenRequests} limit={limit} />
        <RecentRequestsSkeleton />
      </section>
    );
  }

  if (isError) {
    return (
      <section className={sectionFrame()}>
        <RecentRequestsHeader onOpen={handleOpenRequests} limit={limit} />
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
        <RecentRequestsHeader onOpen={handleOpenRequests} limit={limit} />
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
      <RecentRequestsHeader onOpen={handleOpenRequests} limit={limit} />
      <RecentRequestsStrip items={recent} />
    </motion.section>
  );
}
