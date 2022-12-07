<template>
  <div>
    <div class="q-mt-md q-mx-md">
      <span class="text-h4">{{ signedIn ? user.displayName : 'Profile' }}</span>
      <div class="q-mt-md button-group">
        <div>
          <span class="text-body1">Appearance</span>
          <q-separator />
          <div class="text-body2 option q-ma-sm">
            <span>Theme</span>
            <q-btn-toggle
              v-model="darkMode"
              push
              :toggle-color="darkMode ? 'grey-9' : 'yellow-8'"
              :options="[
                { value: false, slot: 'one' },
                { value: true, slot: 'two' },
              ]"
            >
              <template v-slot:one>
                <q-icon name="light_mode" />
              </template>
              <template v-slot:two>
                <q-icon name="dark_mode" />
              </template>
            </q-btn-toggle>
          </div>
          <span class="text-body1">Behavior</span>
          <q-separator />
          <div v-if="!signedIn" class="text-body2 option q-ma-sm">
            <span>Cloud sync</span>
            <q-btn push icon="login" label="Login" color="accent" @click="goToSignIn()" />
          </div>
          <div class="text-body2 option q-ma-sm">
            <span>Manage Stores</span>
            <q-btn push dense icon="add" class="q-pa-sm" size="12px" @click="newStore()" />
          </div>
          <q-list class="stores-list q-mx-sm">
            <q-item v-for="store in stores" :key="store.id">
              <q-item-section>{{ store.name }}</q-item-section>
              <q-item-section avatar>
                <div class="row">
                  <q-btn flat dense icon="edit" class="q-mr-xs" size="12px" @click="editStore(store)" />
                  <q-btn flat dense icon="delete" size="12px" @click="removeStore(store)" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <q-separator spaced />
        <q-btn v-if="signedIn" icon="logout" color="accent" push label="Log out" @click="logOut()" style="bottom: 0" />
      </div>
    </div>
    <LogOutDialog :opened="logOutDialogOpened" @close="closeLogOutDialog()" />
    <NewStore :opened="newStoreOpened" @set-opened="(o) => (newStoreOpened = o)" />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from 'src/stores/userStore';
import { useRouter } from 'vue-router';
import LogOutDialog from 'src/components/LogOutDialog.vue';
import NewStore from 'src/components/NewStore.vue';
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { Store } from 'src/model/Zettel';
import { removeStoreFromIDB, deleteUserStore, setDarkMode } from 'src/assets/ZettelActions';
import { useStores } from 'src/composables/useStores';

const user = useUserStore().user;
const signedIn = useUserStore().signedIn;
const router = useRouter();
const stores = ref([] as Store[]);

useStores().onStores((s) => (stores.value = s));

const $q = useQuasar();
const darkMode = ref($q.dark.isActive);
const logOutDialogOpened = ref(false);
const newStoreOpened = ref(false);

watch(darkMode, (value) => {
  $q.dark.set(value);
  setDarkMode(value);
});

function goToSignIn() {
  router.push('/sign-in');
}

function logOut() {
  logOutDialogOpened.value = true;
}

function closeLogOutDialog() {
  logOutDialogOpened.value = false;
}

function newStore() {
  newStoreOpened.value = true;
}

function removeStore(store: Store) {
  if (signedIn) {
    deleteUserStore(user.uid, store.id);
  } else {
    removeStoreFromIDB(store);
  }
}

function editStore(store: Store) {
  $q.notify('Available soon...');
}
</script>

<style lang="scss">
.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 2.2rem;
}

.body--dark {
  & .q-btn-group {
    & button:first-of-type {
      background-color: rgb(35, 35, 35);
    }
  }
  & .stores-list {
    border-color: rgba(255, 255, 255, 0.28);
    & .q-item {
      border-color: rgba(255, 255, 255, 0.28);
    }
  }
}

.stores-list {
  border: 1px solid #e0e0e0;
  border-bottom-width: 4px;
  border-radius: 0.5rem;
  & .q-item {
    border-bottom: 1px solid #e0e0e0;
    &:last-of-type {
      border-bottom: none;
    }
  }
}
</style>
