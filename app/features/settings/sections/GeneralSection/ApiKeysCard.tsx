"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useApiKeys } from "@hooks/api/queries/useApiKeys";

import { SettingsCard } from "../../components/SettingsCard";
import { ApiKeyRow } from "./ApiKeyRow";
import { CreateApiKeyDialog } from "./CreateApiKeyDialog";
import { connectionError, connectionList, connectionMeta } from "./styles";

export function ApiKeysCard() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useApiKeys();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <SettingsCard title={t("api.keys.title")} description={t("api.keys.description")} anchor="api-keys">
      {isLoading ? (
        <span className={connectionMeta()}>{t("api.keys.loading")}</span>
      ) : error ? (
        <span className={connectionError()}>{t("api.keys.loadError", { message: error.message })}</span>
      ) : data && data.length > 0 ? (
        <div className={connectionList()}>
          {data.map((apiKey) => (
            <ApiKeyRow key={apiKey.id} apiKey={apiKey} />
          ))}
        </div>
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
