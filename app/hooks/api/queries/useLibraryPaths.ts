import type { inferRouterInputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

type PathInputs = inferRouterInputs<AppRouter>["library"]["paths"];

export function useLibraryPaths(enabled = true) {
  return trpc.library.paths.list.useQuery(undefined, { enabled, staleTime: 0, refetchOnMount: "always" });
}

export function useJudgeLibraryFolder(input: PathInputs["judgeFolder"], enabled: boolean) {
  return trpc.library.paths.judgeFolder.useQuery(input, { enabled, staleTime: 0 });
}

export function useCheckLibraryFolder(input: PathInputs["checkFolder"], enabled: boolean) {
  return trpc.library.paths.checkFolder.useQuery(input, { enabled, staleTime: 0 });
}
