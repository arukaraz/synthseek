import type { ArtistMonitorScope, MonitorScope, Option } from "../types";

export interface AlbumMonitorControlProps {
  label: string;
  value: MonitorScope;
  onChange: (value: MonitorScope) => void;
}

export interface ArtistMonitorControlProps {
  label: string;
  value: ArtistMonitorScope;
  onChange: (value: ArtistMonitorScope) => void;
}

export interface ScopeRadioListProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}
