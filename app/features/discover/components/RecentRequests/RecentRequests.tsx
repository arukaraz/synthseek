"use client";

import { FadeScroll } from "@components/FadeScroll";
import { EmptyState } from "@components/ui/EmptyState";
import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useRecentRequests } from "../../hooks/useRecentRequests";
import { requestLayoutFor } from "./helpers";
import { RecentRequestCard } from "./RecentRequestCard";
import { RecentRequestsSkeleton } from "./RecentRequestsSkeleton";
import { requestsBody, requestsList } from "./styles";
import type { RecentRequestsProps } from "./types";

export function RecentRequests({ size, info }: RecentRequestsProps) {
  const { t } = useTranslation("discover");
  const router = useRouter();
  const { recent, isLoading, isError, limit } = useRecentRequests();
  const layout = requestLayoutFor(size);

  const handleOpenRequests = () => {
    router.push("/requests");
  };

  const header = (
    <WidgetHeader
      icon={Download}
      title={t("recentRequests.title")}
      subtitle={t("recentRequests.subtitle", { count: limit })}
      titleId="recent-requests-heading"
      info={info}
      action={{
        label: t("recentRequests.open"),
        ariaLabel: t("recentRequests.openAriaLabel"),
        onClick: handleOpenRequests,
      }}
    />
  );

  if (isLoading) {
    return (
      <section className={glassPanelCard({ height: "auto" })} aria-labelledby="recent-requests-heading">
        {header}
        <RecentRequestsSkeleton layout={layout} />
      </section>
    );
  }

  if (isError || recent.length === 0) {
    return (
      <section className={glassPanelCard({ height: "auto" })} aria-labelledby="recent-requests-heading">
        {header}
        {isError ? (
          <EmptyState
            icon={AlertCircle}
            title={t("recentRequests.errorTitle")}
            description={t("recentRequests.errorDescription")}
          />
        ) : (
          <EmptyState
            icon={Download}
            title={t("recentRequests.emptyTitle")}
            description={t("recentRequests.emptyDescription")}
          />
        )}
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
      <div className={requestsBody()}>
        <FadeScroll>
          <div className={requestsList({ layout })}>
            {recent.map((request) => (
              <RecentRequestCard key={request.id} request={request} layout={layout} />
            ))}
          </div>
        </FadeScroll>
      </div>
    </motion.section>
  );
}
