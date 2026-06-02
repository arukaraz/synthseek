"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Download } from "lucide-react";
import { useRouter } from "next/navigation";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { useRecentRequests } from "../../hooks/useRecentRequests";
import { RecentRequestsSkeleton } from "./RecentRequestsSkeleton";
import { RecentRequestsStrip } from "./RecentRequestsStrip";

export function RecentRequests() {
  const router = useRouter();
  const { recent, isLoading, isError, limit } = useRecentRequests();

  const handleOpenRequests = () => {
    router.push("/requests");
  };

  const header = (
    <WidgetHeader
      icon={Download}
      title="Recent requests"
      subtitle={`Last ${limit} downloads`}
      titleId="recent-requests-heading"
      action={{ label: "Open Requests", ariaLabel: "Open requests page", onClick: handleOpenRequests }}
    />
  );

  if (isLoading) {
    return (
      <section className={glassPanelCard({ height: "auto" })} aria-labelledby="recent-requests-heading">
        {header}
        <RecentRequestsSkeleton />
      </section>
    );
  }

  if (isError) {
    return (
      <section className={glassPanelCard({ height: "auto" })} aria-labelledby="recent-requests-heading">
        {header}
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
      <section className={glassPanelCard({ height: "auto" })} aria-labelledby="recent-requests-heading">
        {header}
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
      className={glassPanelCard({ height: "auto" })}
      aria-labelledby="recent-requests-heading"
    >
      {header}
      <RecentRequestsStrip items={recent} />
    </motion.section>
  );
}
