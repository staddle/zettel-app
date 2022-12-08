<template>
  <q-pull-to-refresh @refresh="refreshZettels">
    <div class="q-ma-md column items-center">
      <div class="full-width">
        <div v-if="signedIn()">
          <div class="text-body1">Welcome,</div>
          <div class="text-h4 q-mb-lg">
            {{ user().displayName }}
          </div>
        </div>
        <div v-else class="text-h5 q-mb-lg">Welcome,</div>
        <ZettelList
          @new-zettel="newZettel = true"
          @delete-zettel="(z) => openDeleteDialog(z)"
          @provide-refresh="(r) => (refreshZettels = r)"
        />
        <q-page-sticky position="bottom-right" :offset="[16, 16]">
          <q-btn fab push icon="add" color="accent" @click="newZettel = true" />
        </q-page-sticky>
        <q-dialog v-model="newZettel">
          <q-card>
            <q-card-section>
              <div class="text-h6">Zettel name</div>
            </q-card-section>

            <q-card-section>
              <q-input
                dense
                rounded
                ref="inputRef"
                v-model="newZettelName"
                autofocus
                label="Name"
                :rules="[
                  (val) => val.length > 0 || 'Please type a name',
                  (val) => val.length < 20 || 'Name is too long',
                ]"
                @keyup.enter="addZettel()"
              />
            </q-card-section>

            <q-card-actions align="right" class="text-primary">
              <q-btn push label="Cancel" @click="cancelAddZettel()" v-close-popup />
              <q-btn push label="Add" color="primary" @click="addZettel()" />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-dialog v-model="deleteZettelOpened">
          <q-card>
            <q-card-section>
              <div class="text-h6 column">
                <span>Are you sure you want to delete</span>
                <span class="text-primary row flex-center">{{ deleteZettelObject.title }}</span>
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn push label="Cancel" v-close-popup />
              <q-btn push label="Delete" color="negative" @click="deleteZettel(deleteZettelObject.id)" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-pull-to-refresh>
</template>

<script lang="ts" setup>
import { ref as dbRef, set } from '@firebase/database';
import { firebaseDatabase as db } from 'boot/firebase';
import { QInput } from 'quasar';
import ZettelList from 'src/components/ZettelList.vue';
import { Zettel } from 'src/model/Zettel';
import { useUserStore } from 'src/stores/userStore';
import { Ref, ref } from 'vue';
import { addZettel as addZettelToDb, addZettelToIDB, removeZettelFromIDB } from 'src/assets/ZettelActions';
import { useQuasar } from 'quasar';

const signedIn = () => useUserStore().signedIn;
const user = () => useUserStore().user;
const newZettel = ref(false);
const deleteZettelOpened = ref(false);
const deleteZettelObject: Ref<Zettel> = ref({} as Zettel);
const inputRef: Ref<QInput | null> = ref(null);
const newZettelName = ref('');
const refreshZettels = ref((done: () => void) => {
  done();
});

const $q = useQuasar();

function addZettel() {
  if (signedIn()) {
    inputRef.value?.validate();
    if (inputRef.value?.hasError) {
      return;
    }
    addZettelToDb(user().uid, newZettelName.value);
  } else {
    addZettelToIDB(newZettelName.value).catch((reason: string) => $q.notify(reason));
  }
  newZettel.value = false;
}

function cancelAddZettel(): void {
  newZettelName.value = '';
  inputRef.value?.resetValidation();
}

function deleteZettel(zettelId: string) {
  console.log('deleteZettel');
  if (signedIn()) {
    set(dbRef(db, `zettels/${user().uid}/${zettelId}`), null);
  } else {
    removeZettelFromIDB(zettelId).catch((reason: string) => $q.notify(reason));
  }
  deleteZettelObject.value = {} as Zettel;
  deleteZettelOpened.value = false;
}

function openDeleteDialog(zettel: Zettel) {
  deleteZettelObject.value = zettel;
  deleteZettelOpened.value = true;
}
</script>

<style scoped>
.avatar-sm {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
