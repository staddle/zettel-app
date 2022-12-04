<template>
  <div class="q-ma-md column items-center">
    <div v-if="signedIn()" class="full-width">
      <div class="text-body1">Welcome,</div>
      <div class="text-h4 q-mb-lg">
        {{ user().displayName }}
      </div>
      <ZettelList @new-zettel="newZettel = true" />
      <q-page-sticky position="bottom-right" :offset="[24, 24]">
        <q-btn fab icon="add" color="accent" @click="newZettel = true" />
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
              :rules="[(val) => val.length > 0 || 'Please type a name', (val) => val.length < 20 || 'Name is too long']"
              @keyup.enter="addZettel()"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" @click="cancelAddZettel()" v-close-popup />
            <q-btn label="Add" color="accent" @click="addZettel()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="deleteZettelOpened">
        <q-card>
          <q-card-section>
            <div class="text-h6 column">
              <span>Are you sure you want to delete</span>
              <span class="text-accent q-pl-md">{{ deleteZettelObject.title }}</span>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn label="Delete" color="negative" @click="deleteZettel(deleteZettelObject.id)" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
    <div v-else>Please <q-btn @click="goToSignIn()"> sign-in </q-btn> to continue</div>
  </div>
</template>

<script lang="ts" setup>
import { DataSnapshot, onValue, push, ref as dbRef, set } from '@firebase/database';
import { firebaseDatabase as db } from 'boot/firebase';
import { get } from 'firebase/database';
import { QInput } from 'quasar';
import { getUserFromDB } from 'src/assets/UserActions';
import UserAvatar from 'src/components/UserAvatar.vue';
import ZettelList from 'src/components/ZettelList.vue';
import { User } from 'src/model/User';
import { Zettel } from 'src/model/Zettel';
import { useUserStore } from 'src/stores/userStore';
import { onMounted, Ref, ref } from 'vue';
import { useRouter } from 'vue-router';

const signedIn = () => useUserStore().signedIn;
const user = () => useUserStore().user;
const newZettel = ref(false);
const deleteZettelOpened = ref(false);
const deleteZettelObject: Ref<Zettel> = ref({} as Zettel);
const inputRef: Ref<QInput | null> = ref(null);
const newZettelName = ref('');

const router = useRouter();

function addZettel() {
  if (signedIn()) {
    inputRef.value?.validate();
    if (inputRef.value?.hasError) {
      return;
    }
    const newZettelRef = push(dbRef(db, `zettels/${user().uid}/`));
    const zettel = {
      id: newZettelRef.key ?? '',
      title: newZettelName.value,
      owner: user().uid,
    } as Zettel;
    set(newZettelRef, zettel);
  }
  newZettel.value = false;
}

/*function refreshZettels(done: () => void) {
  if (signedIn()) {
    const zettelRef = dbRef(db, `zettels/${user().uid}/`);
    get(zettelRef).then((snapshot) => {
      assignZettels(snapshot);
      done();
    });
  } else {
    done();
  }
}*/

function cancelAddZettel(): void {
  newZettelName.value = '';
  inputRef.value?.resetValidation();
}

function openDeleteDialog(zettel: Zettel) {
  deleteZettelObject.value = zettel;
  deleteZettelOpened.value = true;
}

function deleteZettel(zettelId: string) {
  if (signedIn()) {
    set(dbRef(db, `zettels/${user().uid}/${zettelId}`), null);
    deleteZettelObject.value = {} as Zettel;
    deleteZettelOpened.value = false;
  }
}

function goToSignIn() {
  router.push('/sign-in');
}
</script>

<style scoped>
.avatar-sm {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
