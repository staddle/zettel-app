<template>
  <div class="header-color full-height">
    <div class="row justify-between q-py-sm q-px-md items-end">
      <div class="row items-center">
        <q-icon name="arrow_back_ios" class="q-mr-xs cursor-pointer" size="1.4rem" @click="goBack()" />
        <div class="text-h6 text-accent" v-if="zettel.title">{{ zettel.title }}</div>
      </div>
      <div class="row items-center">
        <div class="text-body2 q-mr-xs" v-if="zettel.title" style="margin-top: 1px">
          by {{ user.displayName ?? 'You' }}
        </div>
        <q-btn dense flat round icon="sort" @click="toggleFilters()" />
      </div>
    </div>
    <div class="filters">
      <q-item class="full-width">
        <q-item-section class="text-body2">
          <span class="row items-center">
            <q-icon name="filter_list" size="24px" class="q-mr-xs" style="margin-bottom: 1px" />Sort by
          </span>
        </q-item-section>
        <q-item-section>
          <q-select
            dense
            v-model="sortBy"
            :options="sortingOptions"
            class="white-select"
            color="accent"
            hide-bottom-space
          />
        </q-item-section>
      </q-item>
      <q-item class="full-width row justify-between">
        <q-item-section class="text-body2">
          <span class="row items-center">
            <q-icon name="check" size="24px" class="q-mr-xs q-pb-xs" />Show done items
          </span>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="showDone" color="accent" />
        </q-item-section>
      </q-item>
    </div>
    <div
      class="row flex-center page-content full-width"
      :class="{ 'filters-shown': filtersShown }"
      @click="closeFilters()"
    >
      <router-view v-if="zettel.title"></router-view>
      <div v-else class="text-body1 column flex-center text-grey-6 q-mt-xl">
        <q-icon name="block" size="60px" />
        <span>Zettel not found</span>
        <q-btn push class="q-mt-sm">
          <router-link class="text-grey-7 text-no-decoration" to="/"> <q-icon name="home" /> Go Home </router-link>
        </q-btn>
      </div>
    </div>
  </div>
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
const filtersShown = ref(false);
const sortBy = ref('Newest');
const sortingOptions = ref(['Newest', 'Oldest', 'A-Z', 'Z-A']);
const showDone = ref(true);

provide('zettel', zettel);
provide('stores', stores);
provide('showDone', showDone);
provide('sortBy', sortBy);

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

function toggleFilters() {
  filtersShown.value = !filtersShown.value;
}

function closeFilters() {
  if (filtersShown.value) filtersShown.value = false;
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

.filters {
  border: 1px solid #e0e0e0;
  border-bottom-width: 4px;
  border-radius: 0.5rem;
  margin: 4px 8px;
  & .q-item {
    padding: 4px 12px;
  }
}
.body--dark .filters {
  border-color: rgba(255, 255, 255, 0.28);
}

.white-select {
  & .q-field__native,
  .q-field__marginal,
  .q-field__control {
    color: white !important;
  }
}

.q-field--standard .q-field__control::before {
  border-color: white !important;
}

.white {
  color: white !important;
}

.filters-shown {
  top: 163px;
  height: calc(100% - 163px);
}

.page-content {
  position: absolute;
  transition: all 0.2s ease-in-out;
  &:not(.filters-shown) {
    top: 50px;
    height: calc(100% - 50px);
  }
}

.body--dark {
  & .header-color {
    background-color: #ffffff0c;
    color: #bbb;
  }
}
</style>
