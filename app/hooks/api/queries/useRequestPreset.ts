import { trpc } from "@utils/trpc";

export function useMyRequestPreset() {
  return trpc.requestPreset.mine.useQuery(undefined, { staleTime: 60 * 1000 });
}

export function useMemberRequestPreset(userId: string | null) {
  return trpc.requestPreset.forMember.useQuery({ userId: userId ?? "" }, { enabled: userId !== null });
}
