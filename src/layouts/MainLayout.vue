<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container style="height: 100vh">
      <router-view />
    </q-page-container>

    <q-footer reveal class="footer-color">
      <q-toolbar class="justify-center q-pa-none">
        <q-tabs dense indicator-color="transparent" active-color="accent" class="justify-around full-width">
          <q-route-tab to="/" label="Drawer" icon="fas fa-paste" class="q-pt-xs" />
          <q-route-tab to="/search" label="Find" icon="search" class="q-pt-xs" />
          <q-route-tab to="/user" label="Profile" icon="account_circle" :alert="hasUserAlerts" class="q-pt-xs" />
        </q-tabs>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onAuthStateChanged } from '@firebase/auth';
import { firebaseAuth } from 'boot/firebase';
import MainDrawer from 'src/components/MainDrawer.vue';
import { getAvatar } from 'src/assets/UserActions';
import { useUserStore } from 'src/stores/userStore';

const userName = ref('');
const userAvatar = ref('');
const hasUserAlerts = useUserStore().hasUserAlerts;

onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    userName.value = user.displayName ?? 'Anonymous';
    userAvatar.value = user.photoURL ?? getAvatar(user.displayName ?? 'Anonymous');
  } else {
    userName.value = '';
    userAvatar.value = getAvatar('');
  }
});
</script>

<style lang="scss">
.header-avatar {
  color: white;
  text-decoration: none;
}

.border-top {
  border-top: 1px solid #ddd;
}

.footer-color {
  background-color: #0000000c;
  color: #777;
}

.body--dark {
  & .footer-color {
    background-color: #ffffff0c;
    color: #bbb;
  }
}
</style>
