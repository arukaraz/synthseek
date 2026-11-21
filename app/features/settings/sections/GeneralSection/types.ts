import type { inferRouterOutputs } from "@trpc/server";
import type { TFunction } from "i18next";

import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ApiKeySummary = RouterOutputs["apiKeys"]["list"][number];
export type CreatedApiKey = RouterOutputs["apiKeys"]["create"];

export interface CredentialSummary {
  id: string;
  name: string;
  created_at: Date;
  last_used_at: Date | null;
}

export type RevokeLabelKey = "api.row.revokeLabel" | "subsonic.row.revokeLabel";

export interface CredentialColumnsArgs<TCredential extends CredentialSummary> {
  t: TFunction<"settings">;
  revoking: boolean;
  onRevoke: (credential: TCredential) => void;
  revokeLabelKey: RevokeLabelKey;
  appOf?: (credential: TCredential) => string | null;
}

export interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type SubsonicCredentialSummary = RouterOutputs["subsonic"]["listCredentials"][number];
export type CreatedSubsonicCredential = RouterOutputs["subsonic"]["createCredential"];

export interface CreateSubsonicCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ConnectionValueFieldProps {
  label: string;
  value: string;
  helper?: string;
  copyAriaLabel: string;
  copiedMessage: string;
  copyFailedMessage: string;
}
