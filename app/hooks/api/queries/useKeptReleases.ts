import type { RequestContainerType } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

export function useKeptReleases(id: string, contentType: RequestContainerType) {
  return trpc.requests.keptReleases.useQuery({ id, contentType });
}
