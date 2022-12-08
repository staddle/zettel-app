import { boot } from 'quasar/wrappers';

const dbName = 'zettels';
let idb: IDBDatabase;
let dbPromise: Promise<IDBDatabase>;

export default boot(async (/*{ app }*/) => {
  const request: IDBOpenDBRequest = indexedDB.open(dbName, 3);
  request.onerror = (event) => {
    console.log('Error opening database', event);
  };
  dbPromise = new Promise((resolve, reject) => {
    request.onupgradeneeded = (event) => {
      const localDB = event.target.result as IDBDatabase;
      const tx = event.target.transaction as IDBTransaction;
      if (event.oldVersion < 1) {
        const zettelStore = localDB.createObjectStore('zettels', { keyPath: 'id' });
        zettelStore.createIndex('owner', 'owner', { unique: false });
      }
      if (event.oldVersion < 2) {
        localDB.createObjectStore('stores', { keyPath: 'id' });
      }
      if (event.oldVersion < 3) {
        localDB.createObjectStore('settings', { keyPath: 'id' });
      }

      tx.oncomplete = () => resolve(localDB);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result as IDBDatabase);
    };
  });
  dbPromise.then((db) => {
    idb = db;
  });
});

function getIdb(): Promise<IDBDatabase> {
  return dbPromise;
}

export { getIdb };
