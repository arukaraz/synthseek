import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useDenyOAuth() {
  return trpc.oauthConsent.deny.useMutation({
    onError: (error) => toast.error(error.message || "Failed to cancel authorization"),
  });
}
