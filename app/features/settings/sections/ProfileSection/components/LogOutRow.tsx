"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useLogout } from "@hooks/api/mutations/auth/useLogout";

import { SettingsField } from "../../../components/SettingsField";
import { logoutRow } from "../styles";

export function LogOutRow() {
  const { t } = useTranslation("settings");
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    await logout.mutateAsync().catch(() => undefined);
    router.replace("/login");
  };

  return (
    <SettingsField
      label={t("profile.account.logout")}
      anchor="account.logout"
      helper={t("profile.account.logoutDescription")}
      className={logoutRow()}
    >
      <div>
        <Button variant="secondary" size="sm" disabled={logout.isPending} onClick={() => void handleLogout()}>
          {logout.isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
          {logout.isPending ? t("profile.account.loggingOut") : t("profile.account.logout")}
        </Button>
      </div>
    </SettingsField>
  );
}
