"use client";

import { useTranslation } from "react-i18next";

import { useRevealSettingsSecret } from "@hooks/api/mutations/settings/useRevealSecret";
import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";

import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import type { EnrichmentCardProps } from "./types";

export function EnrichmentCard({ initial }: EnrichmentCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateConnectionsEnrichment();
  const reveal = useRevealSettingsSecret();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard title={t("metadata.enrichment.title")} optional description={t("metadata.enrichment.description")}>
      <SettingsField
        label={t("metadata.enrichment.fanartKey.label")}
        helper={t("metadata.enrichment.fanartKey.helper")}
      >
        <SettingsSecretInput
          value={draft.fanartApiKey}
          onChange={(v) => setField("fanartApiKey", v)}
          source={{
            kind: "stored",
            reveal: () => reveal({ section: "connections.enrichment", field: "fanartApiKey" }),
          }}
        />
      </SettingsField>

      <SettingsField
        label={t("metadata.enrichment.musicbrainzEmail.label")}
        helper={t("metadata.enrichment.musicbrainzEmail.helper")}
      >
        <SettingsTextInput
          value={draft.musicbrainzEmail}
          onChange={(v) => setField("musicbrainzEmail", v)}
          type="email"
          placeholder={t("metadata.enrichment.musicbrainzEmail.placeholder")}
        />
      </SettingsField>

      <SettingsField
        label={t("metadata.enrichment.acoustidKey.label")}
        helper={t("metadata.enrichment.acoustidKey.helper")}
      >
        <SettingsSecretInput
          value={draft.acoustidApiKey}
          onChange={(v) => setField("acoustidApiKey", v)}
          source={{
            kind: "stored",
            reveal: () => reveal({ section: "connections.enrichment", field: "acoustidApiKey" }),
          }}
        />
      </SettingsField>

      <SettingsField
        label={t("metadata.enrichment.songlinkKey.label")}
        helper={t("metadata.enrichment.songlinkKey.helper")}
      >
        <SettingsSecretInput
          value={draft.songlinkApiKey}
          onChange={(v) => setField("songlinkApiKey", v)}
          source={{
            kind: "stored",
            reveal: () => reveal({ section: "connections.enrichment", field: "songlinkApiKey" }),
          }}
        />
      </SettingsField>

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync(payload))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
