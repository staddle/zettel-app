import { child, get, ref } from 'firebase/database';
import { firebaseDatabase } from 'boot/firebase';

async function getAvatarFromDB(
  userID: string,
  userName?: string
): Promise<string> {
  return await get(child(ref(firebaseDatabase), `users/${userID}`)).then(
    (snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val().photoURL ?? getAvatar(snapshot.val().displayName);
      } else {
        return getAvatar(userName);
      }
    }
  );
}

function getAvatar(userName?: string): string {
  return userName != undefined && userName != ''
    ? 'https://ui-avatars.com/api/?length=1&rounded=true&background=e63946&color=ffffff&name=' +
        userName
    : 'https://ui-avatars.com/api/?length=1&rounded=true&background=e63946&color=ffffff';
}

export { getAvatar, getAvatarFromDB };
