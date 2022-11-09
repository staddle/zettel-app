import { get as dbGet, ref } from '@firebase/database';
import { firebaseDatabase } from 'boot/firebase';
import { Zettel } from 'src/model/Zettel';

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
