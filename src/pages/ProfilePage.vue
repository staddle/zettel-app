<template>
  <div>
    <div class="flex flex-center q-mt-xl" v-if="!signedIn">
      Please <q-btn class="q-mx-sm" @click="goToSignIn()"> sign-in </q-btn> to continue
    </div>
    <div class="q-mt-md q-mx-md" v-else>
      <span class="text-h4">{{ user.displayName }}</span>
      <div class="q-mt-md button-group">
        <q-btn push label="Some Option" />
        <q-btn push label="Some Option" />
        <q-btn push label="Some Option" />
        <q-btn icon="logout" color="accent" push label="Log out" @click="logOut()" />
      </div>
    </div>
    <LogOutDialog :opened="logOutDialogOpened" @close="closeLogOutDialog()" />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from 'src/stores/userStore';
import { useRouter } from 'vue-router';
import LogOutDialog from 'src/components/LogOutDialog.vue';
import { ref } from 'vue';

const user = useUserStore().user;
const signedIn = useUserStore().signedIn;
const router = useRouter();

const logOutDialogOpened = ref(false);

function goToSignIn() {
  router.push('/sign-in');
}

function logOut() {
  logOutDialogOpened.value = true;
}

function closeLogOutDialog() {
  logOutDialogOpened.value = false;
}
</script>

<style>
.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
