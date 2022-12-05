<template>
  <div>
    <div v-if="!loadingZettels">
      <div v-if="zettels.length == 0" class="text-primary row items-center">
        No Zettels found. Click
        <q-btn color="primary" label="here" @click="emit('newZettel')" class="q-mx-xs" />
        to create one.
      </div>
      <q-card v-for="zettel in zettels" :key="zettel.id" class="bg-secondary zettel-card">
        <div class="backdrop" @click="selectZettel(zettel)"></div>
        <q-card-section class="text-h6 row justify-between items-center">
          <span class="z-2">{{ zettel.title }}</span>
          <q-btn color="grey-7 z-2" round flat icon="more_vert">
            <q-menu cover auto-close>
              <q-list>
                <q-item clickable class="items-center">
                  <q-icon name="fas fa-pen-to-square" class="q-pr-xs"></q-icon>
                  <q-item-section><router-link :to="`/zettel/${zettel.id}`">Edit</router-link></q-item-section>
                </q-item>
                <q-item clickable class="items-center">
                  <q-icon name="fas fa-share" class="q-pr-xs"></q-icon>
                  <q-item-section>Share</q-item-section>
                </q-item>
                <q-item clickable class="items-center" @click="onDeleteZettel(zettel)">
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
              <UserAvatar :user="owners[zettel.owner]" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div v-else class="row justify-center">
      <q-spinner color="primary" size="3em" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DataSnapshot, onValue, get, ref as dbRef } from '@firebase/database';
import { firebaseDatabase as db } from 'boot/firebase';
import { getUserFromDB } from 'src/assets/UserActions';
import { deleteZettel } from 'src/assets/ZettelActions';
import { User } from 'src/model/User';
import { Zettel } from 'src/model/Zettel';
import { useUserStore } from 'src/stores/userStore';
import { onMounted, Ref, ref } from 'vue';
import { useRouter } from 'vue-router';
import UserAvatar from './UserAvatar.vue';

const router = useRouter();
onMounted(fetchZettels);

const signedIn = () => useUserStore().signedIn;
const user = () => useUserStore().user;
const zettels: Ref<Zettel[]> = ref([]);
const owners: Ref<{
  [key: string]: User;
}> = ref({});
const loadingZettels = ref(true);
const emit = defineEmits<{
  (event: 'newZettel'): void;
  (event: 'deleteZettel', zettel: Zettel): void;
}>();

function fetchZettels() {
  if (signedIn()) {
    const zettelRef = dbRef(db, `zettels/${user().uid}/`);
    onValue(zettelRef, (snapshot) => {
      loadingZettels.value = false;
      assignZettels(snapshot);
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

async function getOwnerDetails(ownerID: string): Promise<User> {
  return await getUserFromDB(ownerID);
}

function onDeleteZettel(zettel: Zettel) {
  deleteZettel(zettel.owner, zettel.id);
}

function selectZettel(zettel: Zettel) {
  router.push(`/zettel/${zettel.id}`);
}
</script>

<style>
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

.zettel-card {
  position: relative;
  width: 100%;
}

.zettel-card:hover .backdrop {
  background-color: #00000010;
}

.z-2 {
  z-index: 2;
}
</style>