import { get as dbGet, onValue, push, ref, set } from '@firebase/database';
import firebase, { firebaseDatabase } from 'boot/firebase';
import { Item, Zettel } from 'src/model/Zettel';

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

export function newItem(uid: string, zettelID: string): void {
  const pushRef = push(ref(firebaseDatabase, `zettels/${uid}/${zettelID}/items`));
  set(pushRef, { id: pushRef.key } as Item);
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
