const DB_NAME = "app";
const STORES = ["bg", "photoWall"];
const DB_VERSION = 2;

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  if (db) return Promise.resolve(db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      STORES.forEach((name) => {
        if (!database.objectStoreNames.contains(name)) {
          database.createObjectStore(name);
        }
      });
    };

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
  });
};

const makeKey = (namespace: string, key: string) => `${namespace}:${key}`;

const wrapRequest = (request: IDBRequest): Promise<any> => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getStore = async (
  storeName: string,
  mode: IDBTransactionMode = "readonly"
) => {
  const db = await initDB();
  return db.transaction(storeName, mode).objectStore(storeName);
};

export const setItem = async (storeName: string, key: string, data: any) => {
  const store = await getStore(storeName, "readwrite");
  return wrapRequest(store.put(data, makeKey(storeName, key)));
};

export const deleteData = async (storeName: string, key: string) => {
  const store = await getStore(storeName, "readwrite");
  return wrapRequest(store.delete(makeKey(storeName, key)));
};

export const getItem = async (storeName: string, key: string) => {
  const store = await getStore(storeName);
  return wrapRequest(store.get(makeKey(storeName, key)));
};
