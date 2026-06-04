"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useApiKeys } from "@hooks/api/queries/useApiKeys";

import { emptyPanel, subSection, subSectionHeader, subSectionHeaderText, subSectionTitle } from "../../styles";
import { ApiKeyRow } from "./ApiKeyRow";
import { CreateApiKeyDialog } from "./CreateApiKeyDialog";

export function ApiKeysSubsection() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useApiKeys();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className={subSection()}>
      <header className={subSectionHeader()}>
        <div className={subSectionHeaderText()}>
          <h3 className={subSectionTitle()}>{t("api.keys.title")}</h3>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />
          {t("api.keys.newKey")}
        </Button>
      </header>

      {isLoading ? (
        <span className="text-fg/60 text-sm">{t("api.keys.loading")}</span>
      ) : error ? (
        <span className="text-sm text-red-400">{t("api.keys.loadError", { message: error.message })}</span>
      ) : !data || data.length === 0 ? (
        <div className={emptyPanel()}>
          <span className="text-fg/60 text-sm">{t("api.keys.empty")}</span>
        </div>
      ) : (
        <div className="flex flex-col">
          {data.map((apiKey) => (
            <ApiKeyRow key={apiKey.id} apiKey={apiKey} />
          ))}
        </div>
      )}

      <CreateApiKeyDialog open={createOpen} onOpenChange={setCreateOpen} />
    </section>
  );
}
