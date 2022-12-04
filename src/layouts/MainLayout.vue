<template>
  <q-layout view="hHh lpR fFf">
    <q-drawer v-model="rightDrawerOpen" side="right" overlay bordered>
      <MainDrawer :user-name="userName" @close="toggleRightDrawer()" />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer reveal class="bg-grey-2 text-grey-7 border-top">
      <q-toolbar class="justify-center q-pa-none">
        <q-tabs dense indicator-color="transparent" active-color="accent" class="justify-around full-width">
          <q-route-tab to="/" label="Drawer" icon="fas fa-paste" />
          <q-route-tab to="/search" label="Find" icon="search" />
          <q-route-tab to="/user" label="Profile" icon="account_circle" :alert="hasUserAlerts" />
        </q-tabs>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { onAuthStateChanged } from '@firebase/auth';
import { firebaseAuth } from 'boot/firebase';
import MainDrawer from 'src/components/MainDrawer.vue';
import { getAvatar } from 'src/assets/UserActions';
import { useUserStore } from 'src/stores/userStore';

const userName = ref('');
const userAvatar = ref('');
const rightDrawerOpen = ref(false);
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

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}
</script>

<style lang="scss">
.header-avatar {
  color: white;
  text-decoration: none;
}

.border-top {
  border-top: 1px solid #ddd;
}
</style>
