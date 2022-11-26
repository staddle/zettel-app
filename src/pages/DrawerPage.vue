<template>
  <div class="q-ma-md column items-center">
    <q-pull-to-refresh class="full-width" @refresh="refreshZettels">
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
          <q-card
            v-for="zettel in zettels"
            :key="zettel.id"
            class="bg-secondary zettel-card"
          >
            <div class="backdrop" @click="selectZettel(zettel)"></div>
            <q-card-section class="text-h6 row justify-between items-center">
              <span class="z-2">{{ zettel.title }}</span>
              <q-btn color="grey-7 z-2" round flat icon="more_vert">
                <q-menu cover auto-close>
                  <q-list>
                    <q-item clickable class="items-center">
                      <q-icon
                        name="fas fa-pen-to-square"
                        class="q-pr-xs"
                      ></q-icon>
                      <q-item-section
                        ><router-link :to="`/zettel/${zettel.id}`"
                          >Edit</router-link
                        ></q-item-section
                      >
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
                  <q-btn flat dense rounded class="z-2">
                    <q-avatar
                      :alt="zettel.owner"
                      class="cursor-pointer avatar-sm"
                    >
                      <img :src="getOwnerAvatar(zettel.owner)" />
                    </q-avatar>
                    <q-popup-proxy
                      transition-show="flip-up"
                      transition-hide="flip-down"
                    >
                      <q-banner class="bg-primary text-white">
                        <q-card flat class="bg-primary">
                          <q-card-section class="text-center">
                            {{ owners[zettel.owner].displayName }}
                          </q-card-section>
                          <q-card-actions>
                            <q-btn
                              align="right"
                              color="secondary"
                              label="Visit Profile"
                              class="text-black"
                            />
                          </q-card-actions>
                        </q-card>
                      </q-banner>
                    </q-popup-proxy>
                  </q-btn>
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
    </q-pull-to-refresh>
  </div>
</template>

<script lang="ts" setup>
import { onAuthStateChanged } from '@firebase/auth';
import {
  DataSnapshot,
  onValue,
  push,
  ref as dbRef,
  set,
} from '@firebase/database';
import { firebaseAuth, firebaseDatabase as db } from 'boot/firebase';
import { get } from 'firebase/database';
import { QInput } from 'quasar';
import { getAvatar, getUserFromDB } from 'src/assets/UserActions';
import { User } from 'src/model/User';
import { Zettel } from 'src/model/Zettel';
import { onMounted, Ref, ref } from 'vue';
import { useRouter } from 'vue-router';

const signedIn = ref(false);
const zettels: Ref<Zettel[]> = ref([]);
const newZettel = ref(false);
const deleteZettelOpened = ref(false);
const deleteZettelObject: Ref<Zettel> = ref({} as Zettel);
const inputRef: Ref<QInput | null> = ref(null);
const newZettelName = ref('');
const loadingZettels = ref(true);
const owners: Ref<{
  [key: string]: User;
}> = ref({});
let uid = '';
const router = useRouter();

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
      assignZettels(snapshot);
      loadingZettels.value = false;
    });
  }
}

function assignZettels(snapshot: DataSnapshot) {
  if (snapshot.exists()) {
    zettels.value = Object.values(snapshot.val());
    zettels.value.forEach(async (zettel) => {
      owners.value[zettel.owner] = await getOwnerDetails(zettel.owner);
    });
  } else {
    zettels.value = [];
  }
}

function refreshZettels(done: () => void) {
  if (uid != '') {
    const zettelRef = dbRef(db, `zettels/${uid}/`);
    get(zettelRef).then((snapshot) => {
      assignZettels(snapshot);
      done();
    });
  } else {
    done();
  }
}

function getOwnerAvatar(ownerID: string): string {
  const owner = owners.value[ownerID];
  if (owner != undefined) {
    if (owner.photoURL) {
      return owner.photoURL;
    } else {
      return getAvatar(owner.displayName);
    }
  } else {
    return getAvatar();
  }
}

async function getOwnerDetails(ownerID: string): Promise<User> {
  return await getUserFromDB(ownerID);
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

function selectZettel(zettel: Zettel) {
  router.push(`/zettel/${zettel.id}`);
}
</script>

<style scoped>
.avatar-sm {
  width: 1.5rem;
  height: 1.5rem;
}

.zettel-card {
  position: relative;
  width: 100%;
}

.zettel-card:hover .backdrop {
  background-color: #00000010;
}

.backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1;
  transition: all 0.2s ease-in;
}

.z-2 {
  z-index: 2;
}
</style>
