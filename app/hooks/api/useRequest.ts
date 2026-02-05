import { trpc } from "@utils/trpc";
import { useMemo } from "react";
import { RequestStatus, ACTIVE_STATUSES } from "@api/__generated__/types";
import { useRequestMutations } from "./mutations/useRequestMutations";

const defaultStats = {
  total: 0,
  queued: 0,
  active: 0,
  complete: 0,
  failed: 0,
};

export default function useRequest() {
  const {
    data: requests,
    refetch,
    isLoading,
  } = trpc.requests.getAll.useQuery(undefined, {
    staleTime: 2000,
    refetchOnMount: "always",
  });

  const mutations = useRequestMutations();

  const stats = useMemo(() => {
    if (!requests) {
      return defaultStats;
    }

    return requests.length
      ? {
          total: requests.length,
          queued: requests.filter((r) => r.status === RequestStatus.enum.queued).length,
          active: requests.filter((r) => (ACTIVE_STATUSES as readonly string[]).includes(r.status)).length,
          complete: requests.filter((r) => r.status === RequestStatus.enum.complete).length,
          failed: requests.filter((r) => r.status === RequestStatus.enum.failed).length,
        }
      : defaultStats;
  }, [requests]);

  const getRequest = (id: string) => {
    return requests?.find((r) => r.id === id) || null;
  };

  return {
    requests,
    isLoading,
    refreshRequests: refetch,
    stats,
    getRequest,
    getActions: mutations.getActions,
    addTrackRequestMutation: mutations.addTrackRequest,
    addAlbumRequestMutation: mutations.addAlbumRequest,
    updateRequestMutation: mutations.updateRequest,
    deleteRequestMutation: mutations.deleteRequest,
    clearCompletedRequestMutation: mutations.clearCompleted,
    cancelRequestMutation: mutations.cancelRequest,
  };
}

export { useRequestMutations } from "./mutations/useRequestMutations";
