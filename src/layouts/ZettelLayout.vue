<template>
  <q-page-container>
    <div class="row justify-between q-py-sm q-px-md bg-primary text-white items-end">
      <div class="row items-center">
        <q-icon name="arrow_back_ios" class="q-mr-xs cursor-pointer" size="1.4rem" @click="goBack()" />
        <div class="text-h6">{{ zettel.title }}</div>
      </div>
      <div class="text-body2">by {{ user.displayName }}</div>
    </div>
    <q-separator class="q-mt-xs q-mb-md" />
    <div class="row flex-center">
      <router-view></router-view>
    </div>
  </q-page-container>
</template>

<script lang="ts" setup>
import { Zettel } from 'src/model/Zettel';
import { provide, Ref, ref, toRefs } from 'vue';
import * as ZettelActions from 'assets/ZettelActions';
import { User } from 'src/model/User';
import { useUserStore } from 'src/stores/userStore';
import { useStoresStore } from 'src/stores/storesStore';
import { useRouter } from 'vue-router';

const props = defineProps<{ zettelID: string }>();
const router = useRouter();

const { zettelID } = toRefs(props);
const zettel: Ref<Zettel> = ref({} as Zettel);
const user = ref({} as User);

provide('zettel', zettel);

if (useUserStore().signedIn) {
  user.value = useUserStore().user;
  await ZettelActions.onZettel(user.value.uid, zettelID.value, (z) => {
    zettel.value = z ?? ({} as Zettel);
  });
  useStoresStore().keepUpdatingStores(user.value.uid);
}

function goBack() {
  router.back();
}
</script>

<style>
.q-layout {
  min-height: inherit !important;
}
</style>
