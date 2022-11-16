<template>
  <div class="item bg-secondary row items-center">
    <div class="title">
      <span>{{ item.name == '' ? item.name : 'No Name' }}</span>
      <span v-if="item.store">in {{ item.store.name }}</span>
    </div>
    <div class="actions">
      <q-btn color="primary" round flat size="0.7rem" icon="fa-solid fa-pen">
      </q-btn>
      <q-btn color="accent" round flat size="0.7rem" icon="fa-solid fa-xmark">
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Item } from 'src/model/Zettel';
import { toRefs } from 'vue';

const props = defineProps<{ item: Item }>();

const { item } = toRefs(props);
</script>

<style lang="scss">
.item {
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin: 0.5rem;
  min-width: 20rem;
  @media screen and (max-width: 600px) {
    min-width: 15rem;
  }
}

.title {
  flex: 1;
  padding-left: 1rem;
}
</style>
