import { get as dbGet, onValue, push, ref, set } from '@firebase/database';
import { firebaseDatabase } from 'boot/firebase';
import { Item, Store, Zettel } from 'src/model/Zettel';
import { getIdb } from 'boot/indexedDBSync';

export async function get(uid: string, zettelID: string): Promise<Zettel | null> {
  return await dbGet(ref(firebaseDatabase, `zettels/${uid}/${zettelID}`)).then((snapshot) => {
    if (snapshot.exists()) {
      return snapshot.val() as Zettel;
    } else {
      console.log(`No data available for uid/zettelID: ${uid}/${zettelID}`);
      return null;
    }
  });
}

export async function onZettel(
  uid: string,
  zettelID: string,
  callback: (zettel: Zettel | null) => void
): Promise<void> {
  onValue(ref(firebaseDatabase, `zettels/${uid}/${zettelID}`), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      console.log(`No data available for uid/zettelID: ${uid}/${zettelID}`);
      callback(null);
    }
  });
}

export function addZettel(uid: string, title: string) {
  const newZettelRef = push(ref(firebaseDatabase, `zettels/${uid}/`));
  const zettel = {
    id: newZettelRef.key ?? '',
    title: title,
    owner: uid,
  } as Zettel;
  set(newZettelRef, zettel);
}

export async function newItem(uid: string, zettelID: string): Promise<Item> {
  const pushRef = push(ref(firebaseDatabase, `zettels/${uid}/${zettelID}/items`));
  const newItem = { id: pushRef.key } as Item;
  return set(pushRef, newItem).then(() => newItem);
}

export function updateItem(uid: string, zettelID: string, newItem: Item): Promise<void> {
  const itemRef = ref(firebaseDatabase, `zettels/${uid}/${zettelID}/items/${newItem.id}`);
  return set(itemRef, newItem);
}

export async function markItemDone(uid: string, zettelID: string, itemID: string, done = true): Promise<void> {
  const itemRef = ref(firebaseDatabase, `zettels/${uid}/${zettelID}/items/${itemID}/done`);
  await set(itemRef, done);
}

export async function deleteItem(uid: string, zettelID: string, itemID: string): Promise<void> {
  const dataRef = ref(firebaseDatabase, `zettels/${uid}/${zettelID}/items/${itemID}`);
  await set(dataRef, null);
}

export async function deleteZettel(uid: string, zettelID: string): Promise<void> {
  const dataRef = ref(firebaseDatabase, `zettels/${uid}/${zettelID}`);
  await set(dataRef, null);
}

export function getStores(callback: (stores: Store[]) => void): void {
  //return ['Aldi', 'Lidl', 'Edeka', 'Rewe', 'Netto', 'Penny', 'Kaufland', 'Real', 'Aldi Nord', 'Aldi Süd'];
  onValue(ref(firebaseDatabase, 'stores'), (snapshot) => {
    if (snapshot.exists()) {
      callback(Object.values(snapshot.val()));
    } else {
      callback([]);
    }
  });
}

export function getUserStores(uid: string, callback: (stores: Store[]) => void): void {
  //return ['Aldi', 'Lidl', 'Edeka', 'Rewe', 'Netto', 'Penny', 'Kaufland', 'Real', 'Aldi Nord', 'Aldi Süd'];
  onValue(ref(firebaseDatabase, `users/${uid}/stores`), (snapshot) => {
    if (snapshot.exists()) {
      callback(Object.values(snapshot.val()));
    } else {
      callback([]);
    }
  });
}

export async function addStore(store: Store): Promise<void> {
  const pushRef = push(ref(firebaseDatabase, 'stores'));
  store.id = pushRef.key ?? 'error getting ID';
  await set(pushRef, store);
}

export async function addUserStore(uid: string, store: Store): Promise<void> {
  const pushRef = push(ref(firebaseDatabase, `users/${uid}/stores`));
  store.id = pushRef.key ?? 'error getting ID';
  await set(pushRef, store);
}

export async function deleteStore(storeID: string): Promise<void> {
  const dataRef = ref(firebaseDatabase, `stores/${storeID}`);
  await set(dataRef, null);
}

export async function deleteUserStore(uid: string, storeID: string): Promise<void> {
  const dataRef = ref(firebaseDatabase, `users/${uid}/stores/${storeID}`);
  await set(dataRef, null);
}

/* indexedDB functions */
export function getID(): string {
  return 'l' + Math.random().toString(36).substr(2, 9);
}

enum IDBOperation {
  GET,
  ADD,
  REMOVE,
  UPDATE,
}

function idbOperation(
  storeName: string,
  operation: IDBOperation,
  data: object = undefined,
  id: string = null
): Promise<void | object> {
  return getIdb().then((db) => {
    const tx: IDBTransaction = db.transaction(storeName, operation == IDBOperation.GET ? 'readonly' : 'readwrite');
    const idbStore: IDBObjectStore = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      let request;
      switch (operation) {
        case IDBOperation.GET:
          if (id) request = idbStore.get(id);
          else request = idbStore.getAll();
          break;
        case IDBOperation.ADD:
          request = idbStore.add(data);
          break;
        case IDBOperation.REMOVE:
          request = idbStore.delete(id);
          break;
        case IDBOperation.UPDATE:
          request = idbStore.put(data);
          break;
      }
      request.onerror = (event) => {
        console.log(`Error performing operation ${operation} on indexedDB`, event);
        reject(`Error performing operation ${operation} on indexedDB`);
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  });
}

const zettelsCallbackList = [];
const singleZettelCallbackList = {};
const storesCallbackList = [];

export function onZettelListIDB(callback: (zettels: Zettel[]) => void): void {
  zettelsCallbackList.push(callback);
  getZettelsFromIDB().then((zettels) => callback(zettels));
}

export function onZettelIDB(zettelID: string, callback: (zettel: Zettel) => void): void {
  if (!singleZettelCallbackList[zettelID]) singleZettelCallbackList[zettelID] = [];
  singleZettelCallbackList[zettelID].push(callback);
  getSingleZettelFromIDB(zettelID).then((z) => callback(z));
}

export async function onStoresIDB(callback: (stores: Store[]) => void): Promise<void> {
  storesCallbackList.push(callback);
  getStoresFromIDB().then((stores) => callback(stores));
}

// Notify all callbacks that the zettels have changed
function notifyZettelsCallbacks(): void {
  getZettelsFromIDB().then((zettels) => zettelsCallbackList.forEach((callback) => callback(zettels)));
}

function notifySingleZettelCallbacks(zettelID): void {
  getSingleZettelFromIDB(zettelID).then((zettel) =>
    singleZettelCallbackList[zettelID].forEach((callback) => callback(zettel))
  );
}

function notifyStoresCallbacks(): void {
  getStoresFromIDB().then((stores) => storesCallbackList.forEach((callback) => callback(stores)));
}

export async function getZettelsFromIDB(): Promise<Zettel[]> {
  return idbOperation('zettels', IDBOperation.GET);
}

export async function addZettelToIDB(title: string): Promise<void> {
  return idbOperation('zettels', IDBOperation.ADD, {
    id: getID(),
    title,
    items: [] as Item[],
    owner: '0',
  } as Zettel).then(notifyZettelsCallbacks);
}

export async function removeZettelFromIDB(id: string): Promise<void> {
  return idbOperation('zettels', IDBOperation.REMOVE, {}, id).then(notifyZettelsCallbacks);
}

export async function getSingleZettelFromIDB(zettelID: string): Promise<Item[]> {
  return idbOperation('zettels', IDBOperation.GET, {}, zettelID);
}

export async function updateZettelIDB(zettel: Zettel): Promise<void> {
  return idbOperation('zettels', IDBOperation.UPDATE, zettel).then(notifySingleZettelCallbacks(zettel.id));
}

export async function getStoresFromIDB(): Promise<Store[]> {
  console.log('getstores');
  return idbOperation('stores', IDBOperation.GET);
}

export async function addStoreToIDB(store: Store): Promise<void> {
  return idbOperation('stores', IDBOperation.ADD, store).then(notifyStoresCallbacks);
}

export async function removeStoreFromIDB(store: Store): Promise<void> {
  return idbOperation('stores', IDBOperation.REMOVE, {}, store.id).then(notifyStoresCallbacks);
}
