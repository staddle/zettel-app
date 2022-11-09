<template>
  <div>
    <span>{{ item.name }}</span>
    <span>in {{ item.store.name }}</span>
  </div>
</template>

<script lang="ts" setup>
import { Item } from 'src/model/Zettel';
import { toRefs } from 'vue';

const props = defineProps<{ item: Item }>();

const { item } = toRefs(props);
</script>

<style></style>
