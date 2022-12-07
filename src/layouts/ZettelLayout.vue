<template>
  <q-page-container>
    <div class="row justify-between q-py-sm q-px-md header-color items-end">
      <div class="row items-center">
        <q-icon name="arrow_back_ios" class="q-mr-xs cursor-pointer" size="1.4rem" @click="goBack()" />
        <div class="text-h6 text-accent" v-if="zettel.title">{{ zettel.title }}</div>
      </div>
      <div class="text-body2" v-if="zettel.title">by {{ user.displayName ?? 'Me' }}</div>
    </div>
    <div class="row flex-center">
      <router-view v-if="zettel.title"></router-view>
      <div v-else class="text-body1 column flex-center text-grey-6 q-mt-xl">
        <q-icon name="block" size="60px" />
        <span>Zettel not found</span>
        <q-btn push class="q-mt-sm">
          <router-link class="text-grey-7 text-no-decoration" to="/"> <q-icon name="home" /> Go Home </router-link>
        </q-btn>
      </div>
    </div>
  </q-page-container>
</template>

<script lang="ts" setup>
import { Store, Zettel } from 'src/model/Zettel';
import { provide, Ref, ref, toRefs } from 'vue';
import * as ZettelActions from 'assets/ZettelActions';
import { User } from 'src/model/User';
import { useUserStore } from 'src/stores/userStore';
import { useRouter } from 'vue-router';
import { useStores } from 'src/composables/useStores';

const props = defineProps<{ zettelID: string }>();
const router = useRouter();

const { zettelID } = toRefs(props);
const zettel: Ref<Zettel> = ref({} as Zettel);
const stores = ref([] as Store[]);
const user = ref({} as User);

provide('zettel', zettel);
provide('stores', stores);

useStores().onStores((s) => {
  stores.value = s;
});

if (useUserStore().signedIn) {
  user.value = useUserStore().user;
  await ZettelActions.onZettel(user.value.uid, zettelID.value, (z) => {
    zettel.value = z ?? ({} as Zettel);
  });
} else if (zettelID.value[0] == 'l') {
  //no sign in but use local indexedDB
  ZettelActions.onZettelIDB(zettelID.value, (z) => {
    zettel.value = z ?? ({} as Zettel);
  });
}

function goBack() {
  router.back();
}
</script>

<style lang="scss">
.q-layout {
  min-height: inherit !important;
}

.header-color {
  background-color: var(--q-primary);
  color: white;
}

.body--dark {
  & .header-color {
    background-color: #ffffff0c;
    color: #bbb;
  }
}
</style>
