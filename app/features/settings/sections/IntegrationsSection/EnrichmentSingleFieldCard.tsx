"use client";

import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";

import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";

type EnrichmentSection = {
  lastfmApiKey: string;
  fanartApiKey: string;
  songlinkApiKey: string;
  acoustidApiKey: string;
  musicbrainzEmail: string;
};

interface EnrichmentSingleFieldCardProps {
  initial: EnrichmentSection;
  field: keyof EnrichmentSection;
  title: string;
  description: string;
  fieldLabel: string;
  helper?: string;
  inputType?: "secret" | "email";
  placeholder?: string;
}

export function EnrichmentSingleFieldCard({
  initial,
  field,
  title,
  description,
  fieldLabel,
  helper,
  inputType = "secret",
  placeholder,
}: EnrichmentSingleFieldCardProps) {
  const update = useUpdateConnectionsEnrichment();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard title={title} description={description}>
      <SettingsField label={fieldLabel} helper={helper}>
        {inputType === "secret" ? (
          <SettingsSecretInput value={draft[field]} onChange={(v) => setField(field, v)} placeholder={placeholder} />
        ) : (
          <SettingsTextInput
            value={draft[field]}
            onChange={(v) => setField(field, v)}
            placeholder={placeholder}
            type="email"
          />
        )}
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
