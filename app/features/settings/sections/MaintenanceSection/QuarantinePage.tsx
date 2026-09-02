"use client";

import { SectionLoading } from "@components/ui/SectionLoading";
import { useSettings } from "@hooks/api/queries/useSettings";

import { MaintenancePage } from "./MaintenancePage";
import { QuarantineSection } from "./QuarantineSection";

export function QuarantinePage() {
  const { data } = useSettings();

  return (
    <MaintenancePage surface="quarantine">
      {data ? (
        <QuarantineSection
          initial={data.engine.import}
          sourceTrust={{
            bannedUsersCount: data.connections.slskd.bannedUsers.length,
            banAfterFailedAttempts: data.engine.search.banAfterFailedAttempts,
          }}
        />
      ) : (
        <SectionLoading />
      )}
    </MaintenancePage>
  );
}
