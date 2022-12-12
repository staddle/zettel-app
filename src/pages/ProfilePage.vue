<template>
  <q-page-container>
    <div class="q-mx-md q-mt-md">
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
            <q-item v-if="stores.length == 0">
              <q-item-section class="flex-center text-grey-8">No stores added yet</q-item-section>
            </q-item>
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
        <q-separator v-if="signedIn" spaced />
        <q-btn v-if="signedIn" icon="logout" color="accent" push label="Log out" @click="logOut()" style="bottom: 0" />
        <q-separator spaced />
        <div class="text-grey-8 text-body2 text-center q-mb-md">
          Made by <a class="text-accent text-bold" href="https://nrosteck.me">staddle</a> | Zettel-App v{{
            versionNumber
          }}
        </div>
      </div>
    </div>
    <LogOutDialog :opened="logOutDialogOpened" @close="closeLogOutDialog()" />
    <NewStore :opened="newStoreOpened" @set-opened="(o) => (newStoreOpened = o)" />
    <q-dialog v-model="deleteDialogOpened">
      <q-card>
        <q-card-section>
          <div class="text-h6 column">
            <span>Are you sure you want to delete store</span>
            <span class="text-accent q-pl-md">{{ deleteStoreObject.name }}</span>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeDeleteDialog()" />
          <q-btn label="Delete" color="negative" @click="deleteStoreFromDB()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page-container>
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
import { useGlobals } from 'src/composables/useGlobals';

const globals = useGlobals();
const user = useUserStore().user;
const signedIn = useUserStore().signedIn;
const router = useRouter();
const stores = ref([] as Store[]);

useStores().onStores((s) => (stores.value = s));

const $q = useQuasar();
const darkMode = ref($q.dark.isActive);
const logOutDialogOpened = ref(false);
const newStoreOpened = ref(false);
const deleteDialogOpened = ref(false);
const deleteStoreObject = ref({} as Store);

const versionNumber = ref(globals.version);

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
  deleteDialogOpened.value = true;
  deleteStoreObject.value = store;
  console.log(store);
}

function closeDeleteDialog() {
  deleteDialogOpened.value = false;
  deleteStoreObject.value = {} as Store;
}

function deleteStoreFromDB() {
  if (signedIn) {
    deleteUserStore(user.uid, deleteStoreObject.value.id).then(closeDeleteDialog);
  } else {
    removeStoreFromIDB(deleteStoreObject.value).then(closeDeleteDialog);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
