import { Trash2 } from "lucide-react";

import { IconButton } from "@components/ui/IconButton";
import type { ColumnDef } from "@components/ui/Table";

import { createdTime, lastUsedTime } from "./helpers";
import { credentialName, credentialRevokeCell, credentialTime } from "./styles";
import type { CredentialColumnsArgs, CredentialSummary } from "./types";

export function buildCredentialColumns<TCredential extends CredentialSummary>({
  t,
  revoking,
  onRevoke,
  revokeLabelKey,
  appOf,
}: CredentialColumnsArgs<TCredential>): ColumnDef<TCredential>[] {
  return [
    {
      key: "name",
      header: t("credentialTable.columns.name"),
      cell: (credential) => <span className={credentialName()}>{credential.name}</span>,
    },
    {
      key: "created",
      header: t("credentialTable.columns.created"),
      cell: (credential) => <span className={credentialTime()}>{createdTime(credential.created_at)}</span>,
      className: "max-sm:hidden",
    },
    {
      key: "lastUsed",
      header: t("credentialTable.columns.lastUsed"),
      cell: (credential) => (
        <span className={credentialTime()}>
          {lastUsedTime(credential.last_used_at) ?? t("credentialTable.neverUsed")}
        </span>
      ),
    },
    ...(appOf === undefined
      ? []
      : [
          {
            key: "app",
            header: t("credentialTable.columns.app"),
            cell: (credential: TCredential) => appOf(credential) ?? "",
            className: "max-md:hidden",
          },
        ]),
    {
      key: "revoke",
      header: <span className="sr-only">{t("credentialTable.columns.actions")}</span>,
      cell: (credential) => (
        <IconButton
          icon={Trash2}
          variant="red"
          size="sm"
          aria-label={t(revokeLabelKey, { name: credential.name })}
          onClick={() => onRevoke(credential)}
          disabled={revoking}
        />
      ),
      className: credentialRevokeCell(),
    },
  ];
}
