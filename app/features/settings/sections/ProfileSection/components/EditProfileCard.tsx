"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useUpdateProfile } from "@hooks/api/mutations/auth/useUpdateProfile";

import { SettingsCard } from "../../../components/SettingsCard";
import { SettingsField } from "../../../components/SettingsField";
import { SettingsTextInput } from "../../../components/SettingsTextInput";
import { SaveBar } from "../../../components/SaveBar";
import { useSettingsForm } from "../../../hooks/useSettingsForm";
import type { ProfileCardProps } from "../types";

export function EditProfileCard({ user }: ProfileCardProps) {
  const { t } = useTranslation("settings");
  const isLocal = user.plex_username === null;
  const update = useUpdateProfile();

  const initial = useMemo(
    () => ({ username: user.username, email: user.email, avatar_url: user.avatar_url ?? "" }),
    [user.username, user.email, user.avatar_url]
  );
  const form = useSettingsForm<{ username: string; email: string; avatar_url: string }>(initial);
  const draft = form.draft;

  if (!draft) return null;

  const handleSave = () =>
    form.save(async (next) => {
      const currentAvatar = user.avatar_url ?? null;
      const nextAvatar = next.avatar_url.trim() === "" ? null : next.avatar_url.trim();
      await update.mutateAsync({
        username: next.username.trim() === user.username ? undefined : next.username.trim(),
        email: isLocal && next.email.trim() !== user.email ? next.email.trim() : undefined,
        avatar_url: nextAvatar === currentAvatar ? undefined : nextAvatar,
      });
    });

  return (
    <SettingsCard title={t("profile.edit.title")}>
      <SettingsField label={t("profile.edit.usernameLabel")}>
        <SettingsTextInput
          value={draft.username}
          onChange={(v) => form.setField("username", v)}
          ariaLabel={t("profile.edit.usernameAriaLabel")}
        />
      </SettingsField>

      <SettingsField
        label={t("profile.edit.emailLabel")}
        helper={isLocal ? undefined : t("profile.edit.emailManagedByPlex")}
      >
        <SettingsTextInput
          type="email"
          value={draft.email}
          onChange={(v) => form.setField("email", v)}
          disabled={!isLocal}
          ariaLabel={t("profile.edit.emailAriaLabel")}
        />
      </SettingsField>

      <SettingsField label={t("profile.edit.avatarLabel")}>
        <SettingsTextInput
          value={draft.avatar_url}
          onChange={(v) => form.setField("avatar_url", v)}
          placeholder={t("profile.edit.avatarPlaceholder")}
          ariaLabel={t("profile.edit.avatarAriaLabel")}
        />
      </SettingsField>

      <SaveBar isDirty={form.isDirty} isSaving={form.isSaving} onSave={handleSave} onCancel={form.reset} />
    </SettingsCard>
  );
}
