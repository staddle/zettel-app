import { get as dbGet, onValue, push, ref, set } from '@firebase/database';
import firebase, { firebaseDatabase } from 'boot/firebase';
import { Item, Store, Zettel } from 'src/model/Zettel';

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

export async function newItem(uid: string, zettelID: string): Promise<Item> {
  const pushRef = push(ref(firebaseDatabase, `zettels/${uid}/${zettelID}/items`));
  const newItem = { id: pushRef.key } as Item;
  return set(pushRef, newItem).then(() => newItem);
}

export function updateItem(uid: string, zettelID: string, newItem: Item): void {
  const itemRef = ref(firebaseDatabase, `zettels/${uid}/${zettelID}/items/${newItem.id}`);
  set(itemRef, newItem);
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
