<template>
  <div class="width-full">
    <q-slide-item class="full-width" left-color="success" right-color="#ff0000" @left="slideLeft" @right="slideRight">
      <template v-slot:left>
        <q-icon name="done" />
      </template>
      <template v-slot:right>
        <q-icon name="delete" />
      </template>
      <q-item-section @click="edit" class="bg-secondary" :class="{ done: item.done }">
        <div class="row q-pa-sm items-center">
          <div class="title">
            <span class="text-body1">{{ item.name && item.name != '' ? item.name : 'No Name' }}</span>
            <span v-if="item.store" class="q-pl-sm store text-body2 text-grey-8">in {{ item.store.name }}</span>
          </div>
        </div>
      </q-item-section>
    </q-slide-item>
  </div>
</template>

<script lang="ts" setup>
import { deleteItem, markItemDone } from 'src/assets/ZettelActions';
import { Item, Zettel } from 'src/model/Zettel';
import { inject, ref, Ref, toRefs } from 'vue';

const props = defineProps<{ item: Item }>();
const { item } = toRefs(props);
const zettel: Ref<Zettel> = inject('zettel') as Ref<Zettel>;
const emit = defineEmits<{
  (e: 'onEdit'): void;
  (e: 'onDelete'): void;
}>();

const deleteItemOpened = ref(false);
const deleteItemObject = ref({} as Item);

function edit(): void {
  emit('onEdit');
}

function deleteIt(): void {
  deleteItem(zettel.value.owner, zettel.value.id, item.value.id);
}

function slideLeft({ reset }: { reset: () => void }): void {
  //mark done
  if (item.value.done) {
    markItemDone(zettel.value.owner, zettel.value.id, item.value.id, false).then(reset);
  } else {
    markItemDone(zettel.value.owner, zettel.value.id, item.value.id).then(reset);
  }
}

function slideRight(): void {
  //delete item
  deleteItemOpened.value = true;
  deleteItemObject.value = item.value;
  emit('onDelete');
}
</script>

<style lang="scss">
.title {
  flex: 1;
  padding-left: 1rem;
}

.done {
  .title {
    text-decoration: line-through;
  }
}
.done::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.3);
}

.close-button {
  top: 0;
  right: 0;
}
</style>
