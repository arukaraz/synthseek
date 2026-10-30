import type { WidgetBlock } from "@hooks/api/queries/widgets/types";

export type ThumbTone = "primary" | "muted" | "faint" | "accent" | "success";

export type ThumbMark =
  | { kind: "box"; x: number; y: number; width: number; height: number; radius: number; tone: ThumbTone }
  | { kind: "shape"; d: string; tone: ThumbTone }
  | { kind: "line"; d: string; tone: ThumbTone }
  | { kind: "dot"; cx: number; cy: number; r: number; tone: ThumbTone };

export interface ViewThumbProps {
  block: WidgetBlock;
}
