import { trpc } from "@utils/trpc";

export function useLogTail(lines: number, refetchMs?: number) {
  return trpc.logs.tail.useQuery(
    { lines },
    {
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: refetchMs && refetchMs > 0 ? refetchMs : false,
    }
  );
}
