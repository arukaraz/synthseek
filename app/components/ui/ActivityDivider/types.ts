export type ActivityDividerState = "idle" | "in-progress" | "plex-sync";

export interface ActivityDividerAnnouncements {
  start: string;
  progress: string;
  complete: string;
}

export interface ActivityDividerProps {
  state: ActivityDividerState;
  value?: number;
  max?: number;
  label?: string;
  labelShort?: string;
  announcements?: ActivityDividerAnnouncements;
  className?: string;
}
