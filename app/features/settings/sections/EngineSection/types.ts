export interface ImportCardProps {
  initial: { metadataConfidenceThreshold: number };
}

export interface QueueCardProps {
  initial: { maxSize: number; maxConcurrentSearches: number; maxPendingImports: number };
}

export interface SearchCardProps {
  initial: {
    search: {
      maxPeerAttempts: number;
      maxVariations: number;
      historyCleanupEnabled: boolean;
      maxHistorySearches: number;
      banAfterFailedAttempts: number;
    };
    smartSearch: {
      customMoodKeywords: string[];
      communityPatternsEnabled: boolean;
    };
  };
}

export interface TimeoutsCardProps {
  initial: {
    searchPhase: number;
    downloadPhase: number;
    importPhase: number;
    peerUnresponsive: number;
    queueWaitActivePeer: number;
    queueWaitIdlePeer: number;
  };
}
