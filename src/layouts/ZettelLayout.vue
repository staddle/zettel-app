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
import { useUserStore } from 'src/stores/userStore';

const props = defineProps<{ zettelID: string }>();

const { zettelID } = toRefs(props);
const zettel: Ref<Zettel> = ref({} as Zettel);
const user = ref({} as User);

provide('zettel', zettel);

if (useUserStore().signedIn) {
  user.value = useUserStore().user;
  console.log(user.value.uid);
  await ZettelActions.onZettel(user.value.uid, zettelID.value, (z) => {
    zettel.value = z ?? ({} as Zettel);
  });
}
</script>

<style></style>
