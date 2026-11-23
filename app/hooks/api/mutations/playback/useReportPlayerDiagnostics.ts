import { trpc } from "@utils/trpc";

export function useReportPlayerDiagnostics() {
  return trpc.playback.reportDiagnostics.useMutation({ trpc: { context: { outliveThePage: true } } });
}
