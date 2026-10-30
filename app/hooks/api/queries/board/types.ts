import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type BoardOutputs = inferRouterOutputs<AppRouter>["discovery"]["board"];
type BoardInputs = inferRouterInputs<AppRouter>["discovery"]["board"];

export type BoardLayout = BoardOutputs["save"];
export type BoardItem = BoardLayout["items"][number];
export type BuiltinBoardItem = Extract<BoardItem, { kind: "builtin" }>;
export type BoardWidgetKey = BuiltinBoardItem["widget"];
export type BoardSize = BoardItem["size"];
export type BoardAppearance = BoardOutputs["appearance"];
export type BoardDensity = BoardAppearance["density"];
export type BoardTextScale = BoardAppearance["text"];
export type BoardTemplatePreview = BoardOutputs["templatePreview"];
export type BoardTemplateApplied = BoardOutputs["templateApply"];
export type BoardTemplateUndo = BoardInputs["templateUndo"];
export type BoardTemplate = BoardOutputs["templateExport"];
