export const ENGINE_DEFAULTS = {
  queue: {
    maxSize: 1000,
    maxConcurrentSearches: 3,
    maxPendingImports: 6,
  },
  search: {
    maxPeerAttempts: 15,
    maxVariations: 6,
    historyCleanupEnabled: true,
    maxHistorySearches: 30,
    banAfterFailedAttempts: 0,
    strictTierOrdering: false,
  },
  timeouts: {
    searchPhase: 15000,
    downloadPhase: 1200000,
    importPhase: 300000,
    peerUnresponsive: 120000,
    queueWaitActivePeer: 480000,
    queueWaitIdlePeer: 720000,
  },
  import: {
    metadataConfidenceThreshold: 50,
    acoustidIdentityGate: true,
  },
  smartSearch: {
    customMoodKeywords: [] as string[],
  },
  wanted: {
    enabled: false,
    perRunCap: 10,
    maxAttempts: 8,
  },
  quality: {
    upgradeEnabled: true,
  },
} as const;
