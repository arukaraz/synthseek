import type { ImageLoaderProps } from "next/image";

import { sizedArtworkSrc } from "./artworkProxy";

export default function artworkLoader({ src, width }: ImageLoaderProps): string {
  return sizedArtworkSrc(src, width);
}
