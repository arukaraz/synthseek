import { trpc } from "@utils/trpc";

export function useVeto() {
  return trpc.widgets.veto.useQuery();
}

export function useVetoTracks() {
  return trpc.widgets.vetoTracks.useQuery();
}
