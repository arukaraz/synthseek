"use client";

import { useTranslation } from "react-i18next";

import { useAuthContext } from "@modules/providers/AuthProvider";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { AccountCard } from "./components/AccountCard";
import { ChangePasswordCard } from "./components/ChangePasswordCard";
import { ConnectedAccountsCard } from "./components/ConnectedAccountsCard";
import { EditProfileCard } from "./components/EditProfileCard";
import { ListeningServicesCard } from "./components/ListeningServicesCard";

export function ProfileSection() {
  const { t } = useTranslation("settings");
  const { currentUser } = useAuthContext();

  if (!currentUser) return null;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("profile.pageTitle")} />
      <AccountCard user={currentUser} />
      <EditProfileCard user={currentUser} />
      <ChangePasswordCard user={currentUser} />
      <ConnectedAccountsCard />
      <ListeningServicesCard />
    </div>
  );
}
