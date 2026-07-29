export interface EngineImportSettings {
  metadataConfidenceThreshold: number;
  acoustidIdentityGate: boolean;
}

export interface ImportCardProps {
  initial: EngineImportSettings;
}

export interface QuarantineSourceTrust {
  bannedUsersCount: number;
  banAfterFailedAttempts: number;
}

export interface QuarantineCardProps {
  initial: EngineImportSettings;
  sourceTrust: QuarantineSourceTrust;
}

export interface QueueCardProps {
  initial: { maxSize: number; maxConcurrentSearches: number; maxPendingImports: number };
}

export interface SmartSearchCardProps {
  initial: {
    customMoodKeywords: string[];
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
