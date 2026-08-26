"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useApiKeys } from "@hooks/api/queries/useApiKeys";

import {
  subSection,
  subSectionDescription,
  subSectionHeader,
  subSectionHeaderText,
  subSectionTitle,
} from "../../styles";
import { ApiKeyRow } from "./ApiKeyRow";
import { CreateApiKeyDialog } from "./CreateApiKeyDialog";
import { connectionMeta } from "./styles";

export function ApiKeysSubsection() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useApiKeys();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className={subSection()}>
      <header className={subSectionHeader()}>
        <div className={subSectionHeaderText()}>
          <h3 className={subSectionTitle()}>{t("api.keys.title")}</h3>
          <p className={subSectionDescription()}>{t("api.keys.description")}</p>
        </div>
      </header>

      {isLoading ? (
        <span className={connectionMeta()}>{t("api.keys.loading")}</span>
      ) : error ? (
        <span className="text-destructive-vivid text-xs">{t("api.keys.loadError", { message: error.message })}</span>
      ) : data && data.length > 0 ? (
        <div className="flex flex-col">
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
    </section>
  );
}
