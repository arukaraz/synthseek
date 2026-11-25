import { artistTarget } from "@features/content-detail";
import type { ProviderArtist } from "@hooks/api/queries/analytics/types";

import type { WidgetItem } from "../CustomWidget/types";

export function topArtistItem(artist: ProviderArtist, plays: string): WidgetItem {
  const { name, image, catalogArtistId } = artist;
  return {
    key: name,
    title: name,
    subtitle: plays,
    cover: image,
    value: null,
    date: null,
    move: null,
    play: null,
    request: null,
    open: catalogArtistId ? artistTarget({ id: catalogArtistId, name, cover: image }) : null,
    link: null,
  };
}
