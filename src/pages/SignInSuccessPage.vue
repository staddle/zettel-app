<template>
  <div>
    <div v-if="signedIn">
      Sign in successful <br />
      Welcome!
    </div>
    <div v-else>Please sign-in to view this page.</div>
  </div>
</template>

<script lang="ts" setup>
import { onAuthStateChanged } from '@firebase/auth';
import { get, ref as dbRef } from '@firebase/database';
import { firebaseAuth, firebaseDatabase } from 'boot/firebase';
import { set } from 'firebase/database';
import { User } from 'src/model/User';
import { useUserStore } from 'src/stores/userStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const signedIn = ref(false);

onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    signedIn.value = true;
    get(dbRef(firebaseDatabase, `users/${user.uid}`)).then((snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        console.log(`${user.displayName} is signed in`);
        useUserStore().logIn(user);
      } else {
        console.log('No user data available, creating new...');
        const authResult = snapshot.val();
        const user2 = {
          uid: authResult.uid,
          displayName: authResult.displayName,
          email: authResult.email,
          photoURL: authResult.photoURL,
        } as User;
        const db = dbRef(firebaseDatabase, `users/${authResult.uid}`);
        set(db, user2).then(() => {
          console.log('User saved to DB');
          useUserStore().logIn(user2);
        });
      }
      router.push('/');
    });
  } else {
    signedIn.value = false;
    useUserStore().logOut();
  }
});
</script>

<style></style>
