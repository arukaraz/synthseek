export interface TrackRetryScheduleProps {
  nextRetryAt: Date | null;
  retryCount: number;
  onRetryNow?: () => void;
}
