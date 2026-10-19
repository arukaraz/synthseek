import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

type BoardOutputs = inferRouterOutputs<AppRouter>["discovery"]["board"];

export type BoardLayout = BoardOutputs["save"];
export type BoardItem = BoardLayout["items"][number];
export type BoardWidgetKey = BoardItem["widget"];
export type BoardSize = BoardItem["size"];
