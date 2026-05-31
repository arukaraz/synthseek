"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@components/ui/Button";
import { useApiKeys } from "@hooks/api/queries/useApiKeys";

import {
  emptyPanel,
  subSection,
  subSectionDescription,
  subSectionHeader,
  subSectionHeaderText,
  subSectionTitle,
} from "../../styles";
import { ApiKeyRow } from "./ApiKeyRow";
import { API_KEYS_SUB } from "./constants";
import { CreateApiKeyDialog } from "./CreateApiKeyDialog";

export function ApiKeysSubsection() {
  const { data, isLoading, error } = useApiKeys();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <section className={subSection()}>
      <header className={subSectionHeader()}>
        <div className={subSectionHeaderText()}>
          <h3 className={subSectionTitle()}>{API_KEYS_SUB.title}</h3>
          <p className={subSectionDescription()}>{API_KEYS_SUB.description}</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />
          {API_KEYS_SUB.newKey}
        </Button>
      </header>

      {isLoading ? (
        <span className="text-fg/60 text-sm">{API_KEYS_SUB.loading}</span>
      ) : error ? (
        <span className="text-sm text-red-400">Failed to load keys: {error.message}</span>
      ) : !data || data.length === 0 ? (
        <div className={emptyPanel()}>
          <span className="text-fg/60 text-sm">{API_KEYS_SUB.empty}</span>
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
