import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useApproveOAuth() {
  return trpc.oauthConsent.approve.useMutation({
    onError: (error) => errorToast(error, "oauth.approveFailed"),
  });
}
