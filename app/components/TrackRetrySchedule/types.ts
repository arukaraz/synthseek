export interface TrackRetryScheduleProps {
  nextRetryAt: Date | null;
  retryCount: number;
  compact?: boolean;
}
