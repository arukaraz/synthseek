import type { SetListDetail, SetSuggestion, SetTrackRow, WidgetAccent } from "@hooks/api/queries/widgets/types";

export type SmartListTab = "tracks" | "removed" | "versions";

export interface SmartListDialogProps {
  widgetId: string;
  slotId: string;
  accent: WidgetAccent;
  onClose: () => void;
}

export interface SmartListHeaderProps {
  widgetId: string;
  detail: SetListDetail;
}

export interface SmartTrackRowProps {
  track: SetTrackRow;
}

export interface SmartVersionsProps {
  widgetId: string;
  detail: SetListDetail;
}

export interface SmartSuggestionRowProps {
  suggestion: SetSuggestion;
}

export interface RatingStarsProps {
  label: string;
  rating: number | null;
  onChange: (rating: number | null) => void;
}
