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
import { ref } from 'vue';

const signedIn = ref(false);

onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    signedIn.value = true;
    get(dbRef(firebaseDatabase, `users/${user.uid}`)).then((snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        console.log(`${user.displayName} is signed in`);
      } else {
        console.log('No user data available, creating new...');
        const authResult = snapshot.val();
        const user = {
          displayName: authResult.displayName,
          email: authResult.email,
          photoURL: authResult.photoURL,
        } as User;
        const db = dbRef(firebaseDatabase, `users/${authResult.uid}`);
        set(db, user).then(() => {
          console.log('User saved to DB');
        });
      }
    });
  } else {
    signedIn.value = false;
  }
});
</script>

<style></style>
