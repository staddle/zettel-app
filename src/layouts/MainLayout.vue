<template>
  <q-layout view="hHh lpR fFf">
    <q-header reveal elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar> <!-- INSERT AVATAR --> </q-avatar>
          <router-link to="/" class="header-avatar"> Zettel App </router-link>
        </q-toolbar-title>

        <q-btn
          dense
          flat
          round
          :icon="`img:${userAvatar}`"
          @click="toggleRightDrawer"
        />
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/" label="Home" />
        <q-route-tab to="/drawer" label="Drawer" />
      </q-tabs>
    </q-header>

    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      overlay
      behavior="mobile"
      elevated
    >
      <MainDrawer :user-name="userName" @close="toggleRightDrawer()" />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onAuthStateChanged } from '@firebase/auth';
import { firebaseAuth } from 'boot/firebase';
import MainDrawer from 'src/components/MainDrawer.vue';
import { getAvatar } from 'src/assets/UserActions';

const userName = ref('');
const userAvatar = ref('');
const rightDrawerOpen = ref(false);

onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    userName.value = user.displayName ?? 'Anonymous';
    userAvatar.value =
      user.photoURL ?? getAvatar(user.displayName ?? 'Anonymous');
  } else {
    userName.value = '';
    userAvatar.value = getAvatar('');
  }
});

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}
</script>

<style>
.header-avatar {
  color: white;
  text-decoration: none;
}
</style>
