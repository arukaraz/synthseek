import { trpc } from "@utils/trpc";
import type { ContentType } from "@api/__generated__/types";

export function useGetContents(contentId: string, enabled = true, type: ContentType) {
  return trpc.music.getContents.useQuery(
    { parentId: contentId, parentType: type },
    {
      enabled: enabled && !!contentId,
      staleTime: 10 * 60 * 1000,
    }
  );
}
