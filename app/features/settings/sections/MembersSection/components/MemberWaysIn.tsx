"use client";

import { Unlink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";
import { InlineError } from "@components/ui/InlineError";
import { useUnlinkMemberIdentity } from "@hooks/api/mutations/users/useMemberSignIn";
import { useUsers } from "@hooks/api/queries/useUsers";
import { confirm } from "@utils/confirm";

import { SettingsField } from "../../../components/SettingsField";
import { identityLabel, isOnlyWayIn } from "../helpers";
import { waysInList, waysInName, waysInNote, waysInRow } from "../styles";
import type { MemberSignInIdentity, MemberWaysInProps } from "../types";

export function MemberWaysIn({ memberId, oidcLabel }: MemberWaysInProps) {
  const { t } = useTranslation("settings");
  const users = useUsers();
  const unlink = useUnlinkMemberIdentity();
  const member = users.data?.find((candidate) => candidate.id === memberId);

  if (!member) return null;

  const onlyWayIn = isOnlyWayIn(member);

  const handleUnlink = async (identity: MemberSignInIdentity) => {
    const method = identityLabel(identity.provider, oidcLabel);
    const confirmed = await confirm({
      title: t("members.waysIn.unlinkTitle"),
      message: t("members.waysIn.unlinkMessage", { method, username: member.username }),
      variant: "danger",
      confirmText: t("members.waysIn.unlinkConfirm"),
    });
    if (confirmed) unlink.mutate({ userId: member.id, identityId: identity.id });
  };

  return (
    <SettingsField label={t("members.waysIn.title")}>
      {member.signInIdentities.length === 0 ? (
        <p className={waysInNote()}>{t("members.waysIn.none")}</p>
      ) : (
        <ul className={waysInList()}>
          {member.signInIdentities.map((identity) => {
            const method = identityLabel(identity.provider, oidcLabel);
            return (
              <li key={identity.id} className={waysInRow()}>
                <span className={waysInName()}>
                  {method}
                  {identity.displayName ? <span className={waysInNote()}> {identity.displayName}</span> : null}
                </span>
                {onlyWayIn ? null : (
                  <IconButton
                    icon={Unlink}
                    variant="red"
                    size="sm"
                    aria-label={t("members.waysIn.unlink", { method })}
                    onClick={() => void handleUnlink(identity)}
                    disabled={unlink.isPending}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      {onlyWayIn ? <p className={waysInNote()}>{t("members.waysIn.lastWayIn")}</p> : null}
      <InlineError error={unlink.error} />
    </SettingsField>
  );
}
