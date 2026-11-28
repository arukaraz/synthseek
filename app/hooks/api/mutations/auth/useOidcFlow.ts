import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useOidcStart() {
  return trpc.auth.oidcStart.useMutation({
    onSuccess: ({ authorizationUrl }) => {
      window.location.assign(authorizationUrl);
    },
  });
}

export function useOidcLinkStart() {
  return trpc.auth.oidcLinkStart.useMutation({
    onSuccess: ({ authorizationUrl }) => {
      window.location.assign(authorizationUrl);
    },
    onError: (error) => errorToast(error, "auth.oidcLinkFailed"),
  });
}
