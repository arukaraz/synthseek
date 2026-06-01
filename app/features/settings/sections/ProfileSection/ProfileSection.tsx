"use client";

import { useAuthContext } from "@modules/providers/AuthProvider";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { AccountCard } from "./components/AccountCard";
import { ChangePasswordCard } from "./components/ChangePasswordCard";
import { ConnectedAccountsCard } from "./components/ConnectedAccountsCard";
import { EditProfileCard } from "./components/EditProfileCard";
import { PROFILE_COPY } from "./constants";

export function ProfileSection() {
  const { currentUser } = useAuthContext();

  if (!currentUser) return null;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={PROFILE_COPY.pageTitle} />
      <AccountCard user={currentUser} />
      <EditProfileCard user={currentUser} />
      <ChangePasswordCard user={currentUser} />
      <ConnectedAccountsCard />
    </div>
  );
}
