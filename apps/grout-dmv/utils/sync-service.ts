import { syncWithBackend, getUnsyncedCount } from './database';

class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = true;

  async initialize() {
    // Start periodic sync
    this.startPeriodicSync();
    
    // Initial sync
    await this.performSync();
  }

  private startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      await this.performSync();
    }, 30 * 60 * 1000); // 30 minutes
  }

  async performSync(): Promise<{ synced: number; failed: number }> {
    try {
      const result = await syncWithBackend();
      console.log(`Sync completed: ${result.synced} synced, ${result.failed} failed`);
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      return { synced: 0, failed: 0 };
    }
  }

  async getUnsyncedCount(): Promise<number> {
    return await getUnsyncedCount();
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncService = new SyncService();