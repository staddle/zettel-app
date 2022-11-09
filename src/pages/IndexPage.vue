<template>
  <div class="column items-center">
    <h1>Index Page</h1>
    <p>
      This is the index page. It is the default page that is shown when the
      application is started.
    </p>
    <router-link v-if="!signedIn" to="/sign-in">
      <q-btn color="accent" icon="fas fa-right-to-bracket" label="Sign In" />
    </router-link>
    <router-link v-else to="/drawer">
      <q-btn color="accent" icon="fas fa-chalkboard" label="Drawer" />
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { onAuthStateChanged } from '@firebase/auth';
import { firebaseAuth } from 'boot/firebase';
import { ref } from 'vue';

const signedIn = ref(false);

onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    signedIn.value = true;
  } else {
    signedIn.value = false;
  }
});
</script>
