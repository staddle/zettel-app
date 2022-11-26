<template>
  <div class="column full-width full-height">
    <div v-if="!zettel.items || zettel.items?.length == 0" class="column flex-center q-mt-lg non-selectable noItems">
      <q-icon name="block" size="60px" />
      <span>No items found.</span>
    </div>
    <div v-for="item in zettel.items" :key="item.id">
      <ZettelItem :item="item" />
    </div>

    <!--sticky button-->
    <q-page-sticky position="bottom-right" :offset="[24, 24]">
      <q-btn fab icon="add" color="accent" @click="newItem()" />
    </q-page-sticky>
  </div>
</template>

<script setup lang="ts">
import ZettelItem from 'src/components/ZettelItem.vue';
import { Item, Zettel } from 'src/model/Zettel';
import { inject, ref, Ref } from 'vue';
import * as ZettelActions from 'assets/ZettelActions';
import { useUserStore } from 'src/stores/userStore';

const zettel: Ref<Zettel> = inject('zettel') as Ref<Zettel>;

function newItem() {
  ZettelActions.newItem(useUserStore().user.uid, zettel.value.id);
}
</script>

<style>
.noItems {
  color: #bbb;
}
</style>
