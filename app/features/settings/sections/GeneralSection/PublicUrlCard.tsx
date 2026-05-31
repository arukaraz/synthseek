"use client";

import { useAuthContext } from "@modules/providers/AuthProvider";
import { useUpdateGeneral } from "@hooks/api/mutations/settings/useUpdateGeneral";
import { useSettings } from "@hooks/api/queries/useSettings";

import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { PUBLIC_URL_CARD } from "./constants";

export function PublicUrlCard() {
  const { isAdmin } = useAuthContext();
  const settings = useSettings({ enabled: isAdmin });
  const update = useUpdateGeneral();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(settings.data?.general);

  if (!isAdmin || !draft) return null;

  return (
    <SettingsCard title={PUBLIC_URL_CARD.title} description={PUBLIC_URL_CARD.description}>
      <SettingsField label={PUBLIC_URL_CARD.label} helper={PUBLIC_URL_CARD.helper}>
        <SettingsTextInput
          value={draft.publicBaseUrl}
          onChange={(value) => setField("publicBaseUrl", value)}
          placeholder={PUBLIC_URL_CARD.placeholder}
          type="url"
          ariaLabel={PUBLIC_URL_CARD.label}
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
