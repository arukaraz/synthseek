import type { MosaicShape } from "../DiscoveryMixes/types";
import type { PlaySetLayout } from "./types";

export const PLAY_SET_MOSAIC_SHAPES: Record<PlaySetLayout, MosaicShape> = {
  stack: "square",
  side: "square",
  banner: "strip",
};
