import { trpc } from "@utils/trpc";

export function useBoardLayout() {
  return trpc.discovery.board.get.useQuery(undefined, { refetchOnMount: "always" });
}
