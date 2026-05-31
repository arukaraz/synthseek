import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useApproveOAuth() {
  return trpc.oauthConsent.approve.useMutation({
    onError: (error) => toast.error(error.message || "Failed to authorize"),
  });
}
