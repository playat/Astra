let db: IDBDatabase | null = null;
const open = (tableKey: string) => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("app", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // 检查数据表是否已存在
      if (!db.objectStoreNames.contains(tableKey)) {
        db.createObjectStore(tableKey);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
  });
};

export const setItem = async (tableKey: string, key: string, value: any) => {
  const db: IDBDatabase = await open(tableKey);
  db.transaction(tableKey, "readwrite")
    .objectStore(tableKey)
    .put(value, key);
};

export const deleteData = async (tableKey: string, key: string) => {
  const db: IDBDatabase = await open(tableKey);
  db.transaction(tableKey, "readwrite").objectStore(tableKey).delete(key);
};

export const getItem = async (tableKey: string, key: string) => {
  const db: IDBDatabase = await open(tableKey);
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(tableKey, "readonly")
      .objectStore(tableKey)
      .get(key);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};
