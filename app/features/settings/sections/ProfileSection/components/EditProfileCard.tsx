"use client";

import { useMemo } from "react";

import { useUpdateProfile } from "@hooks/api/mutations/auth/useUpdateProfile";

import { SettingsCard } from "../../../components/SettingsCard";
import { SettingsField } from "../../../components/SettingsField";
import { SettingsTextInput } from "../../../components/SettingsTextInput";
import { SaveBar } from "../../../components/SaveBar";
import { useSettingsForm } from "../../../hooks/useSettingsForm";
import { PROFILE_COPY } from "../constants";
import type { ProfileCardProps } from "../types";

export function EditProfileCard({ user }: ProfileCardProps) {
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
    <SettingsCard title={PROFILE_COPY.editTitle} description={PROFILE_COPY.editDescription}>
      <SettingsField label={PROFILE_COPY.usernameLabel}>
        <SettingsTextInput value={draft.username} onChange={(v) => form.setField("username", v)} ariaLabel="Username" />
      </SettingsField>

      <SettingsField label={PROFILE_COPY.emailLabel} helper={isLocal ? undefined : PROFILE_COPY.emailManagedByPlex}>
        <SettingsTextInput
          type="email"
          value={draft.email}
          onChange={(v) => form.setField("email", v)}
          disabled={!isLocal}
          ariaLabel="Email"
        />
      </SettingsField>

      <SettingsField label={PROFILE_COPY.avatarLabel}>
        <SettingsTextInput
          value={draft.avatar_url}
          onChange={(v) => form.setField("avatar_url", v)}
          placeholder={PROFILE_COPY.avatarPlaceholder}
          ariaLabel="Avatar URL"
        />
      </SettingsField>

      <SaveBar isDirty={form.isDirty} isSaving={form.isSaving} onSave={handleSave} onCancel={form.reset} />
    </SettingsCard>
  );
}
