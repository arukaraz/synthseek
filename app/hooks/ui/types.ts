import type { ContentType, MusicItem, MusicTrack } from "@api/__generated__/types";
import type { ConfigRequestMode } from "@features/search/components/ConfigRequestModal/types";
import type { DetailTarget } from "@features/content-detail";
import type { LucideIcon } from "lucide-react";
import type { PointerEventHandler, RefObject } from "react";

export interface RequestContext {
  parentAlbum?: MusicItem;
}

export interface PrimaryNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}

export interface FlowState {
  selectedResult: MusicItem | null;
  directTarget: DetailTarget | null;
  showContentDetailModal: boolean;
  showConfigRequestModal: boolean;
  selectedContentToRequest: MusicItem | null;
  parentAlbumFromContext: MusicItem | null;
  preloadedTracks: MusicTrack[] | null;
  configRequestMode: ConfigRequestMode;
}

export interface ContentDetailModalFlowProps {
  open: boolean;
  onClose: () => void;
  onRequestClick: (item: MusicItem, context?: RequestContext) => void;
  onRequestArtistLidarr: (artist: MusicItem) => void;
}

export interface ConfigRequestModalFlowProps {
  isOpen: boolean;
  item: MusicItem | null;
  itemType: ContentType;
  mode: ConfigRequestMode;
  onClose: () => void;
  parentAlbum: MusicItem | null;
  preloadedTracks: MusicTrack[] | undefined;
}

export interface UseContentRequestModalsResult {
  selectedResult: MusicItem | null;
  directTarget: DetailTarget | null;
  selectedContentToRequest: MusicItem | null;
  openForResult: (result: MusicItem) => void;
  openForTarget: (target: DetailTarget) => void;
  requestContent: (requestedItem: MusicItem, context?: RequestContext) => void;
  requestArtistLidarr: (artist: MusicItem) => void;
  requestPlaylistConfig: (playlist: MusicItem, preloadedTracks: MusicTrack[]) => void;
  contentDetailModalProps: ContentDetailModalFlowProps;
  configModalProps: ConfigRequestModalFlowProps;
}

export type SetupRedirectContext = "app" | "login" | "setup";

export type SetupGate =
  | { status: "resolving" }
  | { status: "error"; retry: () => void }
  | { status: "redirecting" }
  | { status: "ready" };

export type PlexPinPhase = "idle" | "pending" | "completed" | "error";

export interface PlexPinStart {
  pinId: string;
  authUrl: string;
}

export interface UsePlexPinPopupOptions<TResolved> {
  start: () => Promise<PlexPinStart>;
  poll: (pinId: string) => Promise<TResolved | null>;
  onResolved: (resolved: TResolved) => void;
  popupBlockedMessage?: string;
  timeoutMessage?: string;
  errorFallbackMessage?: string;
}

export interface UsePlexPinPopupResult {
  start: () => Promise<void>;
  reset: () => void;
  phase: PlexPinPhase;
  isPending: boolean;
}

export interface UseAutoRetryOptions {
  onRetry: () => void;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export interface UseAutoRetryResult {
  retryNow: () => void;
  isRetrying: boolean;
}

export interface UseTapToOpenOptions {
  moveThreshold?: number;
  tapTimeout?: number;
}

export interface TapToOpenTriggerProps {
  onPointerDown: PointerEventHandler;
  onPointerUp: PointerEventHandler;
  onPointerCancel: PointerEventHandler;
}

export interface TapToOpenResult {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
  triggerProps: TapToOpenTriggerProps;
}

export interface UseDismissableResult<TElement extends HTMLElement> {
  open: boolean;
  toggle: () => void;
  close: () => void;
  containerRef: RefObject<TElement | null>;
}

export interface UseInlineRenameOptions {
  value: string;
  onSave: (name: string) => void;
}

export interface UseInlineRenameResult {
  isEditing: boolean;
  draft: string;
  setDraft: (value: string) => void;
  start: () => void;
  save: () => void;
  cancel: () => void;
}

export interface ClientPagination<T> {
  visible: T[];
  paginated: boolean;
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}
