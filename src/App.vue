<template>
  <div>
    <Suspense>
      <router-view />
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { onAuthStateChanged } from '@firebase/auth';
import { firebaseAuth } from './boot/firebase';
import { useUserStore } from './stores/userStore';
import { useQuasar } from 'quasar';
import { getDarkMode, setUpSettings } from './assets/ZettelActions';

const $q = useQuasar();

onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    if (!useUserStore().signedIn) useUserStore().logInFirebase(user);
  } else {
    useUserStore().logOut();
  }
});

getDarkMode()
  .then((darkMode) => {
    $q.dark.set(darkMode);
  })
  .catch(() => {
    setUpSettings();
  });
</script>
