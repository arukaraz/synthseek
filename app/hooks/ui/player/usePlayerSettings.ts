"use client";

import { useMemo, useSyncExternalStore } from "react";

import type { PlayerSettingsActions, PlayerSettingsView } from "@components/Player";
import { useSetPlaybackProfile } from "@hooks/api/mutations/auth/useSetPlaybackProfile";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { playerSettingsActionsOf, playerSettingsViewOf } from "./settingsSlice";
import { EMPTY_STATE, getSnapshot, subscribe } from "./store";

export function usePlayerSettings(): { view: PlayerSettingsView; actions: PlayerSettingsActions } {
  const session = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_STATE);
  const { currentUser } = useAuthContext();
  const { mutate: setProfile } = useSetPlaybackProfile();
  const view = useMemo(() => playerSettingsViewOf(session, currentUser), [session, currentUser]);
  const actions = useMemo(() => playerSettingsActionsOf(setProfile), [setProfile]);
  return { view, actions };
}
