import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type LibrarySourceProvider = RouterInputs["librarySource"]["provider"]["items"]["provider"];
export type LibrarySourceDescription = RouterOutputs["librarySource"]["provider"]["all"][number];
export type LibrarySourceItem = RouterOutputs["librarySource"]["provider"]["items"][number];
export type LibrarySourceItemDetail = RouterOutputs["librarySource"]["provider"]["itemDetail"];
export type LibrarySourceItemType = LibrarySourceItem["type"];
