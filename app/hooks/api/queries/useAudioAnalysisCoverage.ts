import { trpc } from "@utils/trpc";

const COVERAGE_POLL_MS = 15 * 1000;

export function useAudioAnalysisCoverage() {
  return trpc.settings.audioAnalysisCoverage.useQuery(undefined, { refetchInterval: COVERAGE_POLL_MS });
}
