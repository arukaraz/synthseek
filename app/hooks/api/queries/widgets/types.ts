import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

type WidgetOutputs = inferRouterOutputs<AppRouter>["widgets"];

export type WidgetDocument = WidgetOutputs["list"][number];
export type WidgetBlock = WidgetDocument["view"]["block"];
export type WidgetAction = WidgetDocument["view"]["action"];
export type WidgetAccent = WidgetDocument["meta"]["accent"];
export type WidgetBindSlot = keyof NonNullable<WidgetDocument["view"]["bind"]>;
export type WidgetResult = WidgetOutputs["data"];
export type QuestionWidgetResult = Extract<WidgetResult, { type: "question" }>;
export type FeedWidgetResult = Extract<WidgetResult, { type: "feed" }>;
export type WidgetMeasure = QuestionWidgetResult["measure"];
export type WidgetRowOf<R extends WidgetResult, D extends R["dataset"]> = Extract<R, { dataset: D }>["rows"][number];
