import { trpc } from "@utils/trpc";

export function useForgottenFavorites() {
  return trpc.analytics.listening.forgottenFavorites.useQuery();
}
