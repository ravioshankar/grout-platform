class SyncService {
  async initialize() {
    // No-op for local storage
  }

  async performSync(): Promise<{ synced: number; failed: number }> {
    return { synced: 0, failed: 0 };
  }

  async getUnsyncedCount(): Promise<number> {
    return 0;
  }

  stop() {
    // No-op
  }
}

export const syncService = new SyncService();