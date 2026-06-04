import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useDenyOAuth() {
  return trpc.oauthConsent.deny.useMutation({
    onError: (error) => errorToast(error, "oauth.denyFailed"),
  });
}
