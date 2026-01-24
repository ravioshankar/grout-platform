import { syncTestRecordsToBackend, syncTestRecordsFromBackend } from './sync-test-records';

class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize() {
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, 5 * 60 * 1000); // Sync every 5 minutes
  }

  async performSync(): Promise<{ synced: number; failed: number }> {
    try {
      const uploadResult = await syncTestRecordsToBackend();
      const downloadResult = await syncTestRecordsFromBackend();
      
      return {
        synced: uploadResult.synced + downloadResult.synced,
        failed: uploadResult.failed + downloadResult.failed,
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return { synced: 0, failed: 0 };
    }
  }

  async getUnsyncedCount(): Promise<number> {
    return 0;
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncService = new SyncService();