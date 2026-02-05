"use client";

import { ProgressBar } from "@components/ui/ProgressBar";
import { ACTIVE_STATUSES, ContentType, type RequestStatus } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import { formatDuration, formatTimestamp } from "@utils/formatters";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";

interface BaseProgressProps {
  status: RequestStatus;
  createdAt: Date | string;
  completedAt?: Date | string;
  dataCyPrefix?: string;
}

interface TrackProgressProps extends BaseProgressProps {
  variant: "track";
  progress?: number;
  completedTracks?: never;
  totalTracks?: never;
}

interface AlbumProgressProps extends BaseProgressProps {
  variant: "album";
  completedTracks: number;
  totalTracks: number;
  isSingleTrack?: boolean;
  progress?: never;
}

type RequestProgressProps = TrackProgressProps | AlbumProgressProps;

export function RequestProgress(props: RequestProgressProps) {
  const { status, createdAt, completedAt, variant, dataCyPrefix = variant } = props;
  const statusInfo = REQUEST_STATUS_CONFIG[status];
  const isActive = ACTIVE_STATUSES.includes(status as (typeof ACTIVE_STATUSES)[number]);

  const createdDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const completedDate = completedAt instanceof Date ? completedAt : completedAt ? new Date(completedAt) : undefined;
  const duration = formatDuration(createdDate, completedDate);

  const progressPercent =
    variant === ContentType.enum.track
      ? (props.progress ?? 0)
      : props.totalTracks > 0
        ? (props.completedTracks / props.totalTracks) * 100
        : 0;

  return (
    <div className="space-y-1" data-status={status}>
      <div className="flex items-center justify-between text-xs">
        <span className={cn("font-medium", statusInfo.color)} data-cy={`${dataCyPrefix}-status-description`}>
          {statusInfo.description}
        </span>
        <div className="flex items-center gap-2">
          {variant === ContentType.enum.track ? (
            <TrackProgressInfo progress={progressPercent} duration={duration} />
          ) : (
            <AlbumProgressInfo
              completedTracks={props.completedTracks}
              totalTracks={props.totalTracks}
              isSingleTrack={props.isSingleTrack ?? false}
              duration={duration}
              dataCyPrefix={dataCyPrefix}
            />
          )}
          <span className="text-fg/20">{formatTimestamp(createdDate)}</span>
        </div>
      </div>

      {(variant === ContentType.enum.track || !props.isSingleTrack) && (
        <ProgressBar progress={progressPercent} isActive={isActive} />
      )}
    </div>
  );
}

function TrackProgressInfo({ progress, duration }: { progress: number; duration: string | null }) {
  return (
    <>
      {progress > 0 && <span className="text-fg/40 font-mono">{Math.round(progress)}%</span>}
      {duration && <span className="text-fg/30 font-mono">{duration}</span>}
    </>
  );
}

function AlbumProgressInfo({
  completedTracks,
  totalTracks,
  isSingleTrack,
  duration,
  dataCyPrefix,
}: {
  completedTracks: number;
  totalTracks: number;
  isSingleTrack: boolean;
  duration: string | null;
  dataCyPrefix: string;
}) {
  return (
    <>
      {!isSingleTrack && (
        <span className="text-fg/50 font-medium" data-cy={`${dataCyPrefix}-progress-count`}>
          {completedTracks}/{totalTracks} tracks
        </span>
      )}
      {duration && <span className="text-fg/30 font-mono">{duration}</span>}
    </>
  );
}
