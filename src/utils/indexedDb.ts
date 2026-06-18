const DB_NAME = "app";
const STORE = "data";
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const open = (): Promise<IDBDatabase> => {
  if (db) return Promise.resolve(db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      db.onversionchange = () => { db?.close(); db = null; };
      resolve(db);
    };
  });
};

const makeKey = (namespace: string, key: string) => `${namespace}:${key}`;

export const setItem = async (namespace: string, key: string, value: any) => {
  const database = await open();
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, makeKey(namespace, key));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const deleteData = async (namespace: string, key: string) => {
  const database = await open();
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(makeKey(namespace, key));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getItem = async <T = any>(namespace: string, key: string): Promise<T | undefined> => {
  const database = await open();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(makeKey(namespace, key));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
