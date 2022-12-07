<template>
  <div class="width-full">
    <q-slide-item class="full-width" left-color="positive" right-color="negative" @left="slideLeft" @right="slideRight">
      <template v-slot:left>
        <q-icon name="done" color="black" />
      </template>
      <template v-slot:right>
        <q-icon name="delete" />
      </template>
      <q-item-section
        @click="edit"
        :class="{ done: item.done, 'bg-white': !$q.dark.isActive, 'bg-dark-page': $q.dark.isActive }"
      >
        <div class="row q-pa-sm items-center">
          <div class="title">
            <span class="text-body1">{{ item.name && item.name != '' ? item.name : 'No Name' }}</span>
            <span v-if="item.store" class="q-pl-sm store text-body2 text-grey-8">in {{ item.store.name }}</span>
          </div>
        </div>
        <q-separator />
      </q-item-section>
    </q-slide-item>
  </div>
</template>

<script lang="ts" setup>
import { deleteItem, markItemDone, updateZettelIDB } from 'src/assets/ZettelActions';
import { Item, Zettel } from 'src/model/Zettel';
import { useUserStore } from 'src/stores/userStore';
import { inject, ref, Ref, toRefs } from 'vue';
import { useQuasar } from 'quasar';

const props = defineProps<{ item: Item }>();
const { item } = toRefs(props);
const zettel: Ref<Zettel> = inject('zettel') as Ref<Zettel>;
const emit = defineEmits<{
  (e: 'onEdit'): void;
  (e: 'onDelete', callback: () => void): void;
}>();
const $q = useQuasar();
const deleteItemOpened = ref(false);
const deleteItemObject = ref({} as Item);

function edit(): void {
  emit('onEdit');
}

function slideLeft({ reset }: { reset: () => void }): void {
  //mark done
  if (useUserStore().signedIn) {
    markItemDone(zettel.value.owner, zettel.value.id, item.value.id, !item.value.done).then(reset);
  } else {
    const zettelClone = JSON.parse(JSON.stringify(zettel.value));
    const itemClone = JSON.parse(JSON.stringify(item.value));
    zettelClone.items = zettelClone.items.map((i: Item) => {
      if (i.id == itemClone.id) {
        i.done = !i.done;
      }
      return i;
    });
    updateZettelIDB(zettelClone).then(reset);
  }
}

function slideRight({ reset }: { reset: () => void }): void {
  //delete item
  deleteItemOpened.value = true;
  deleteItemObject.value = item.value;
  emit('onDelete', reset);
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
  background-color: rgba(0, 0, 0, 0.1);
}

.body--dark .done::before {
  background-color: rgba(255, 255, 255, 0.025);
}

.close-button {
  top: 0;
  right: 0;
}

.bg-dark-page {
  background-color: #1b1d21;
}
</style>
