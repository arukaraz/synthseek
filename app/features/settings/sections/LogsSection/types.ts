import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type RouterInputs = inferRouterInputs<AppRouter>;

export type LogTailResult = RouterOutputs["logs"]["tail"];
export type LogEntry = LogTailResult["entries"][number];
export type LogLevelName = NonNullable<LogEntry["level"]>;

export type LogLevelSetting = RouterInputs["settings"]["updateSystemLogLevel"]["level"];

export interface LogLineRowProps {
  entry: LogEntry;
}
