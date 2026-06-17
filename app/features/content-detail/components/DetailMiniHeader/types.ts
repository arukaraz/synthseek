import type { DetailMode } from "../../types";

export interface DetailMiniHeaderProps {
  name: string;
  cover: string | null;
  mode: DetailMode;
  canGoBack: boolean;
  onBack: () => void;
  backAriaLabel: string;
  visible: boolean;
}
