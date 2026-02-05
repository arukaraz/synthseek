"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { trpc } from "@utils/trpc";
import { motion } from "framer-motion";
import { AlertCircle, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { LastRequestItem } from "./LastRequestItem";
import { LastRequestsSkeleton } from "./LastRequestsSkeleton";

const RECENT_REQUESTS_LIMIT = 15;

export function LastRequests() {
  const router = useRouter();
  const { data: allRequests, isLoading, isError } = trpc.requests.getAll.useQuery();

  const recentRequests = useMemo(() => {
    if (!allRequests) return [];
    return allRequests
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, RECENT_REQUESTS_LIMIT);
  }, [allRequests]);

  const handleSeeMore = () => {
    router.push("/requests");
  };

  if (isLoading) {
    return <LastRequestsSkeleton />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load requests"
        description="Unable to fetch recent requests. Please try again."
      />
    );
  }

  if (recentRequests.length === 0) {
    return (
      <EmptyState
        icon={Download}
        title="No requests yet"
        description="Start requesting music to see your recent downloads here"
      />
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="relative flex h-full flex-col rounded-xl p-4"
    >
      <div className={gradientOverlay({ direction: "toR", intensity: "subtle" })} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <div>
            <h3 className="text-fg text-lg font-semibold">Last Requests</h3>
            <p className="text-fg/60 text-xs">{`Your last ${RECENT_REQUESTS_LIMIT} downloads`}</p>
          </div>
          <button
            onClick={handleSeeMore}
            aria-label="View all requests"
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            See more →
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {recentRequests.map((request, index) => (
            <LastRequestItem key={request.id} request={request} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
