import { TrackRequest, RequestStatus, ContentType, RequestFormat, RequestMatchingMode } from "@api/__generated__/types";

let trackCounter = 0;

const generateId = () => `track-${++trackCounter}-${Date.now()}`;

const defaultTrackRequest: Omit<TrackRequest, "id"> = {
  slskd_request_id: "slskd-req-001",
  external_id: "track:abc123",
  user_id: null,
  title: "Test Track",
  artist: "Test Artist",
  request_type: ContentType.enum.track,
  isrc: "USRC12345678",
  track_number: 1,
  disc_number: 1,
  duration_ms: 180000,
  status: RequestStatus.enum.queued,
  progress: 0,
  bitrate: 320,
  format: RequestFormat.enum.mp3,
  format_matching: RequestMatchingMode.enum.flexible,
  bitrate_matching: RequestMatchingMode.enum.flexible,
  album_id: "album-001",
  error: null,
  explicit: false,
  source: "provider",
  created_at: new Date("2024-01-01T00:00:00Z"),
  completed_at: null,
  updated_at: new Date("2024-01-01T00:00:00Z"),
};

export function createTrackRequest(overrides?: Partial<TrackRequest>): TrackRequest {
  return {
    id: generateId(),
    ...defaultTrackRequest,
    ...overrides,
  };
}

export function createTrackRequestList(count: number, overrides?: Partial<TrackRequest>): TrackRequest[] {
  return Array.from({ length: count }, (_, i) =>
    createTrackRequest({
      track_number: i + 1,
      title: `Track ${i + 1}`,
      external_id: `track:${i + 1}`,
      ...overrides,
    })
  );
}

export function createCompletedTrack(overrides?: Partial<TrackRequest>): TrackRequest {
  return createTrackRequest({
    status: RequestStatus.enum.complete,
    progress: 100,
    completed_at: new Date(),
    ...overrides,
  });
}

export function createFailedTrack(overrides?: Partial<TrackRequest>): TrackRequest {
  return createTrackRequest({
    status: RequestStatus.enum.failed,
    error: "Download failed",
    ...overrides,
  });
}

export function createCancelledTrack(overrides?: Partial<TrackRequest>): TrackRequest {
  return createTrackRequest({
    status: RequestStatus.enum.cancelled,
    ...overrides,
  });
}

export function createDownloadingTrack(overrides?: Partial<TrackRequest>): TrackRequest {
  return createTrackRequest({
    status: RequestStatus.enum.downloading,
    progress: 50,
    ...overrides,
  });
}

export function resetTrackCounter() {
  trackCounter = 0;
}
