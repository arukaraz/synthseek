import { trpc } from "@utils/trpc";
import type { ContentType } from "@api/__generated__/types";

export default function useGetContents(contentId: string, enabled = true, type: ContentType) {
  return trpc.spotify.getContents.useQuery(
    { parentId: contentId, parentType: type },
    {
      enabled: enabled && !!contentId,
      staleTime: 10 * 60 * 1000,
    }
  );
}
