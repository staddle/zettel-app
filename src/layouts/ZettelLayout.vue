<template>
  <q-layout>
    <q-page-container class="column items-center">
      <h2>{{ zettel.title }}</h2>
      <h5>by {{ zettel.owner }}</h5>
      <div class="row items-center justify-center">
        <router-view></router-view>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { Zettel } from 'src/model/Zettel';
import { provide, Ref, ref, toRefs } from 'vue';
import * as ZettelActions from 'assets/ZettelActions';
import { User } from 'src/model/User';
import { onAuthStateChanged } from '@firebase/auth';
import { firebaseAuth } from 'boot/firebase';
import { getUserFromDB } from 'src/assets/UserActions';

const props = defineProps<{ zettelID: string }>();

const { zettelID } = toRefs(props);
const zettel: Ref<Zettel> = ref({} as Zettel);
const user = ref({} as User);
const uid = ref('');

provide('user', user);
provide('zettel', zettel);

onAuthStateChanged(firebaseAuth, async (signedInUser) => {
  if (signedInUser) {
    uid.value = signedInUser.uid;
    await ZettelActions.onZettel(uid.value, zettelID.value, (z) => {
      zettel.value = z ?? ({} as Zettel);
    });
    getUserFromDB(signedInUser.uid).then((user2) => {
      user.value = user2;
    });
  }
});
</script>

<style></style>
