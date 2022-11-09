import { get as dbGet, onValue, push, ref, set } from '@firebase/database';
import firebase, { firebaseDatabase } from 'boot/firebase';
import { Item, Zettel } from 'src/model/Zettel';

export async function get(
  uid: string,
  zettelID: string
): Promise<Zettel | null> {
  return await dbGet(ref(firebaseDatabase, `zettels/${uid}/${zettelID}`)).then(
    (snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val() as Zettel;
      } else {
        console.log(`No data available for uid/zettelID: ${uid}/${zettelID}`);
        return null;
      }
    }
  );
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
  const pushRef = push(ref(firebaseDatabase, `zettels/${uid}/${zettelID}`));
  set(pushRef, { id: pushRef.key } as Item);
}
