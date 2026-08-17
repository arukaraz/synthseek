import { ContentType, type RequestContainerType } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

interface UseRequestDetailArgs {
  id: string | null;
  contentType: RequestContainerType | null;
}

export function useRequestDetail({ id, contentType }: UseRequestDetailArgs) {
  return trpc.requests.getDetail.useQuery(
    { id: id ?? "", contentType: contentType ?? ContentType.enum.album },
    {
      enabled: !!id && !!contentType,
      staleTime: 2000,
      refetchOnMount: "always",
    }
  );
}
