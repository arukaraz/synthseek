import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ApiKeySummary = RouterOutputs["apiKeys"]["list"][number];
export type CreatedApiKey = RouterOutputs["apiKeys"]["create"];

export interface ApiKeyRowProps {
  apiKey: ApiKeySummary;
}

export interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
