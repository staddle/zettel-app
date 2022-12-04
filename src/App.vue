<template>
  <div>
    <Suspense>
      <router-view />
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { onAuthStateChanged } from '@firebase/auth';
import { Suspense } from 'vue';
import { RouterView } from 'vue-router';
import { firebaseAuth } from './boot/firebase';
import { useUserStore } from './stores/userStore';

onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    if (!useUserStore().signedIn) useUserStore().logInFirebase(user);
  } else {
    useUserStore().logOut();
  }
});
</script>
