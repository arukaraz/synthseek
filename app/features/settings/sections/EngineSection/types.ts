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

export interface EngineQualitySettings {
  upgradeEnabled: boolean;
}

export interface QualityCardProps {
  initial: EngineQualitySettings;
}

export interface EngineWantedSettings {
  enabled: boolean;
  perRunCap: number;
  maxAttempts: number;
}

export interface WantedCardProps {
  initial: EngineWantedSettings;
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
