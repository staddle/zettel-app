<template>
  <div>{{ zettel.title }}</div>
</template>

<script setup lang="ts">
import { Zettel } from 'src/model/Zettel';
import { inject, onMounted, Ref, ref } from 'vue';

/*const props = defineProps<{
  zettel: Zettel;
}>();

const { zettel } = toRefs(props);*/

const zettel: Ref<Zettel> = inject('zettel') as Ref<Zettel>;
</script>

<style></style>
