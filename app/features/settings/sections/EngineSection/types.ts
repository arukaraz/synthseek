export interface ImportCardProps {
  initial: { metadataConfidenceThreshold: number };
}

export interface QueueCardProps {
  initial: { maxSize: number; maxConcurrentSearches: number; maxPendingImports: number };
}

export interface SmartSearchCardProps {
  initial: {
    customMoodKeywords: string[];
    federatedPatternsEnabled: boolean;
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
