import type { ContentType, MusicItem } from "@api/__generated__/types";
import type { ConfigRequestMode } from "@features/search/components/ConfigRequestModal/types";
import type { RequestContext } from "@features/search/components/ContentBrowserModal/types";
import type { LucideIcon } from "lucide-react";
import type { PointerEventHandler, RefObject } from "react";

export interface PrimaryNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}

export interface FlowState {
  selectedResult: MusicItem | null;
  showContentBrowserModal: boolean;
  showConfigRequestModal: boolean;
  selectedContentToRequest: MusicItem | null;
  parentAlbumFromContext: MusicItem | null;
  configRequestMode: ConfigRequestMode;
}

export interface ContentBrowserModalFlowProps {
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
}

export interface UseContentRequestModalsResult {
  selectedResult: MusicItem | null;
  selectedContentToRequest: MusicItem | null;
  openForResult: (result: MusicItem) => void;
  requestArtistLidarr: (artist: MusicItem) => void;
  browserModalProps: ContentBrowserModalFlowProps;
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
