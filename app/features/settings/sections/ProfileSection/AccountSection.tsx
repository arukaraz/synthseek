"use client";

import { useTranslation } from "react-i18next";

import { useAuthContext } from "@modules/providers/AuthProvider";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot, sectionGrid } from "../../styles";
import { AccountCard } from "./components/AccountCard";
import { ChangePasswordCard } from "./components/ChangePasswordCard";
import { EditProfileCard } from "./components/EditProfileCard";
import { MyRequestPresetCard } from "./components/MyRequestPresetCard";
import { QuotaCard } from "./components/QuotaCard";

export function AccountSection() {
  const { t } = useTranslation("settings");
  const { currentUser } = useAuthContext();
  const page = SETTINGS_PAGE_BY_ID.account;

  if (!currentUser) return null;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      <AccountCard user={currentUser} />
      <EditProfileCard user={currentUser} />
      <div className={sectionGrid()}>
        <QuotaCard />
        <MyRequestPresetCard />
      </div>
      <ChangePasswordCard user={currentUser} />
    </div>
  );
}
