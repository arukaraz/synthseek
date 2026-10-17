"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { DataTable } from "@components/ui/Table";
import { useRevokeApiKey } from "@hooks/api/mutations/api-keys/useRevokeApiKey";
import { useApiKeys } from "@hooks/api/queries/useApiKeys";
import { confirm } from "@utils/confirm";

import { SettingsCard } from "../../components/SettingsCard";
import { CreateApiKeyDialog } from "./CreateApiKeyDialog";
import { buildCredentialColumns } from "./credentialColumns";
import { connectionError, connectionMeta } from "./styles";
import type { ApiKeySummary } from "./types";

export function ApiKeysCard() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useApiKeys();
  const revoke = useRevokeApiKey();
  const [createOpen, setCreateOpen] = useState(false);

  const handleRevoke = async (apiKey: ApiKeySummary) => {
    const confirmed = await confirm({
      title: t("api.revoke.title"),
      message: t("api.revoke.message"),
      confirmText: t("api.revoke.confirm"),
      variant: "danger",
    });
    if (confirmed) revoke.mutate({ id: apiKey.id });
  };

  const columns = buildCredentialColumns({
    t,
    revoking: revoke.isPending,
    onRevoke: handleRevoke,
    revokeLabelKey: "api.row.revokeLabel",
  });

  return (
    <SettingsCard title={t("api.keys.title")} description={t("api.keys.description")} anchor="api-keys">
      {isLoading ? (
        <span className={connectionMeta()}>{t("api.keys.loading")}</span>
      ) : error ? (
        <span className={connectionError()}>{t("api.keys.loadError", { message: error.message })}</span>
      ) : data && data.length > 0 ? (
        <DataTable data={data} columns={columns} getRowId={(apiKey) => apiKey.id} staggerDelay={0} />
      ) : (
        <span className={connectionMeta()}>{t("api.keys.empty")}</span>
      )}

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />
          {t("api.keys.newKey")}
        </Button>
      </div>

      <CreateApiKeyDialog open={createOpen} onOpenChange={setCreateOpen} />
    </SettingsCard>
  );
}
