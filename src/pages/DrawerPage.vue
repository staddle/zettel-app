<template>
  <div class="q-ma-md column items-center">
    <h2>Drawer</h2>
    <div v-if="signedIn">
      <div v-if="!loadingZettels">
        <div v-if="zettels.length == 0" class="text-primary row items-center">
          No Zettels found. Click
          <q-btn
            color="primary"
            label="here"
            @click="newZettel = true"
            class="q-mx-xs"
          />
          to create one.
        </div>
        <q-card v-for="zettel in zettels" :key="zettel.id" class="bg-secondary">
          <q-card-section class="text-h6 row justify-between items-center">
            {{ zettel.title }}
            <q-btn color="grey-7" round flat icon="more_vert">
              <q-menu cover auto-close>
                <q-list>
                  <q-item clickable class="items-center">
                    <q-icon
                      name="fas fa-pen-to-square"
                      class="q-pr-xs"
                    ></q-icon>
                    <q-item-section>Edit</q-item-section>
                  </q-item>
                  <q-item clickable class="items-center">
                    <q-icon name="fas fa-share" class="q-pr-xs"></q-icon>
                    <q-item-section>Share</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    class="items-center"
                    @click="openDeleteDialog(zettel)"
                  >
                    <q-icon name="fas fa-trash" class="q-pr-xs"></q-icon>
                    <q-item-section>Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-card-section>
          <q-card-section>
            <div class="row justify-between">
              <div>
                by
                <q-avatar
                  :icon="ownerIcons[zettel.owner]"
                  :alt="zettel.owner"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div v-else class="row justify-center">
        <q-spinner color="primary" size="3em" />
      </div>
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
              :rules="[
                (val) => val.length > 0 || 'Please type a name',
                (val) => val.length < 20 || 'Name is too long',
              ]"
              @keyup.enter="addZettel()"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn
              flat
              label="Cancel"
              @click="cancelAddZettel()"
              v-close-popup
            />
            <q-btn label="Add" color="accent" @click="addZettel()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="deleteZettelOpened">
        <q-card>
          <q-card-section>
            <div class="text-h6 column">
              <span>Are you sure you want to delete</span>
              <span class="text-accent q-pl-md">{{
                deleteZettelObject.title
              }}</span>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn
              label="Delete"
              color="negative"
              @click="deleteZettel(deleteZettelObject.id)"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
    <div v-else>Please sign-in to continue</div>
  </div>
</template>

<script lang="ts" setup>
import { onAuthStateChanged } from '@firebase/auth';
import { onValue, push, ref as dbRef, set } from '@firebase/database';
import { firebaseAuth, firebaseDatabase as db } from 'boot/firebase';
import { QInput } from 'quasar';
import { getAvatarFromDB } from 'src/assets/UserActions';
import { Zettel } from 'src/model/Zettel';
import { onMounted, Ref, ref } from 'vue';

const signedIn = ref(false);
const zettels: Ref<Zettel[]> = ref([]);
const newZettel = ref(false);
const deleteZettelOpened = ref(false);
const deleteZettelObject: Ref<Zettel> = ref({} as Zettel);
const inputRef: Ref<QInput | null> = ref(null);
const newZettelName = ref('');
const loadingZettels = ref(true);
const ownerIcons: Ref<{
  [key: string]: string;
}> = ref({});
let uid = '';

onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    signedIn.value = true;
    uid = user.uid;
    fetchZettels();
  } else {
    signedIn.value = false;
  }
});

onMounted(() => fetchZettels);

function fetchZettels() {
  if (uid != '') {
    const zettelRef = dbRef(db, `zettels/${uid}/`);
    onValue(zettelRef, (snapshot) => {
      if (snapshot.exists()) {
        zettels.value = Object.values(snapshot.val());
        zettels.value.forEach((zettel) => {
          getOwnerAvatar(zettel.owner).then((icon) => {
            ownerIcons.value[zettel.owner] = icon;
          });
        });
      }
      loadingZettels.value = false;
    });
  }
}

async function getOwnerAvatar(ownerID: string): Promise<string> {
  return 'img:' + (await getAvatarFromDB(ownerID));
}

function addZettel() {
  if (uid != '') {
    inputRef.value?.validate();
    if (inputRef.value?.hasError) {
      return;
    }
    const newZettelRef = push(dbRef(db, `zettels/${uid}/`));
    const zettel = {
      id: newZettelRef.key ?? '',
      title: newZettelName.value,
      owner: uid,
    } as Zettel;
    set(newZettelRef, zettel);
  }
  newZettel.value = false;
}

function cancelAddZettel(): void {
  newZettelName.value = '';
  inputRef.value?.resetValidation();
}

function openDeleteDialog(zettel: Zettel) {
  deleteZettelObject.value = zettel;
  deleteZettelOpened.value = true;
}

function deleteZettel(zettelId: string) {
  if (uid != '') {
    set(dbRef(db, `zettels/${uid}/${zettelId}`), null);
    deleteZettelObject.value = {} as Zettel;
    deleteZettelOpened.value = false;
  }
}
</script>
