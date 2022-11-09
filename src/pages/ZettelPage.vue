<template>
  <div class="column">
    <div v-if="!zettel.items || zettel.items?.length == 0">
      No items found, create a new one.
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
import { User } from 'src/model/User';
import { Zettel } from 'src/model/Zettel';
import { inject, Ref, ref } from 'vue';
import * as ZettelActions from 'assets/ZettelActions';

const zettel: Ref<Zettel> = inject('zettel') as Ref<Zettel>;
const user = inject('user') as Ref<User>;

function newItem() {
  ZettelActions.newItem(user.value.uid, zettel.value.id);
}
</script>

<style></style>
