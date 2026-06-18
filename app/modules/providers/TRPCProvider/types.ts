import type { ReactNode } from "react";
import type { QueryKey, QueryStatus } from "@tanstack/react-query";

export interface TRPCProviderProps {
  children: ReactNode;
}

export interface DehydrateCandidate {
  queryKey: QueryKey;
  state: { status: QueryStatus };
}

export interface QueryProcedurePath {
  router: string;
  procedure: string | null;
}
