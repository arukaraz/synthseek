import type { RequestStatus, RequestWithTracks } from "@api/__generated__/types";

export interface RequestDetailProps {
  request: RequestWithTracks | null;
  onBack: () => void;
}

export interface RequestDetailHeroProps {
  request: RequestWithTracks;
  onBack: () => void;
}

export interface RequestDetailStatsProps {
  request: RequestWithTracks;
}

export interface RequestDetailStatsCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  valueClassName?: string;
}

export interface RequestDetailTracksProps {
  request: RequestWithTracks;
}

export interface TrackStatusIconProps {
  status: RequestStatus;
}
