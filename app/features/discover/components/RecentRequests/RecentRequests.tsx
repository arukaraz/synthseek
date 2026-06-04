"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { useRecentRequests } from "../../hooks/useRecentRequests";
import { RecentRequestsSkeleton } from "./RecentRequestsSkeleton";
import { RecentRequestsStrip } from "./RecentRequestsStrip";

export function RecentRequests() {
  const { t } = useTranslation("discover");
  const router = useRouter();
  const { recent, isLoading, isError, limit } = useRecentRequests();

  const handleOpenRequests = () => {
    router.push("/requests");
  };

  const header = (
    <WidgetHeader
      icon={Download}
      title={t("recentRequests.title")}
      subtitle={t("recentRequests.subtitle", { count: limit })}
      titleId="recent-requests-heading"
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
          title={t("recentRequests.errorTitle")}
          description={t("recentRequests.errorDescription")}
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
          title={t("recentRequests.emptyTitle")}
          description={t("recentRequests.emptyDescription")}
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
