import type { OrbitAlbum } from "@hooks/api/queries/analytics/types";

import type { CoverActionButtonProps } from "../CustomWidget/types";

export interface OrbitCardProps extends CoverActionButtonProps {
  album: OrbitAlbum;
  onOpen: () => void;
}
