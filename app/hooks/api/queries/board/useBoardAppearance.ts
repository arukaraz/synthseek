import { trpc } from "@utils/trpc";

export function useBoardAppearance() {
  return trpc.discovery.board.appearance.useQuery();
}
