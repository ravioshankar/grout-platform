const DB_NAME = 'roadready_db';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export const initIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        if (!database.objectStoreNames.contains('user_profile')) {
          database.createObjectStore('user_profile', { keyPath: 'id', autoIncrement: true });
        }
        if (!database.objectStoreNames.contains('test_results')) {
          database.createObjectStore('test_results', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('bookmarks')) {
          database.createObjectStore('bookmarks', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('study_plan')) {
          database.createObjectStore('study_plan', { keyPath: 'id', autoIncrement: true });
        }
        if (!database.objectStoreNames.contains('settings')) {
          database.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getDB = (): IDBDatabase => {
  if (!db) throw new Error('IndexedDB not initialized');
  return db;
};

export const getAll = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    try {
      const transaction = getDB().transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
};

export const getOne = <T>(storeName: string, key: IDBValidKey): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const add = <T>(storeName: string, data: T): Promise<IDBValidKey> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const put = <T>(storeName: string, data: T): Promise<IDBValidKey> => {
  return new Promise((resolve, reject) => {
    try {
      const transaction = getDB().transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
};

export const remove = (storeName: string, key: IDBValidKey): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const transaction = getDB().transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
};

export const clear = (storeName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const transaction = getDB().transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
};
