import { initDatabase, getDatabase } from './database';

export async function migrateTableNames() {
  try {
    await initDatabase();
    const db = getDatabase();
    
    // Check if old test_results table exists
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='test_results'"
    );
    
    if (tables.length > 0) {
      console.log('Migrating test_results to test_records...');
      
      // Rename table
      await db.execAsync(`
        ALTER TABLE test_results RENAME TO test_records;
      `);
      
      console.log('Migration completed successfully');
      return true;
    }
    
    console.log('No migration needed');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}
