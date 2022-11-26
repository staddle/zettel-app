<template>
  <div class="width-full">
    <q-slide-item class="full-width" left-color="success" right-color="#ff0000" @left="slideLeft" @right="slideRight">
      <template v-slot:left>
        <q-icon name="done" />
      </template>
      <template v-slot:right>
        <q-icon name="delete" />
      </template>
      <q-item-section class="rounded-borders bg-secondary" :class="{ done: item.done }">
        <div class="row q-pa-sm items-center">
          <div class="title">
            <span>{{ item.name && item.name != '' ? item.name : 'No Name' }}</span>
            <span v-if="item.store">in {{ item.store.name }}</span>
          </div>
          <div class="actions">
            <q-btn color="primary" round flat size="0.7rem" icon="fa-solid fa-pen" @click="edit"></q-btn>
            <q-btn color="accent" round flat size="0.7rem" icon="fa-solid fa-xmark" @click="deleteIt()"> </q-btn>
          </div>
        </div>
      </q-item-section>
    </q-slide-item>

    <!--Dialogs-->
    <q-dialog v-model="deleteItemOpened">
      <q-card>
        <q-card-section>
          <div class="text-h6 column">
            <span>Are you sure you want to delete</span>
            <span class="text-accent q-pl-md">{{ deleteItemObject?.name }}</span>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeDeleteItemDialog()" />
          <q-btn label="Delete" color="negative" @click="deleteItemAfterDialog()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="editing" seamless position="bottom">
      <q-card>
        <q-card-section class="row items-center justify-between full-width no-wrap">
          <q-input v-model="newName" @keyup.enter="doneEdit()" class="full-width" />
          <q-btn color="primary" round flat size="0.7rem" icon="fa-solid fa-check" @click="doneEdit()"></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { deleteItem, updateItem, markItemDone } from 'src/assets/ZettelActions';
import { Item, Zettel } from 'src/model/Zettel';
import { inject, ref, Ref, toRefs } from 'vue';

const props = defineProps<{ item: Item }>();
const { item } = toRefs(props);
const zettel: Ref<Zettel> = inject('zettel') as Ref<Zettel>;
const emit = defineEmits<{
  (e: 'notify', message: string): void;
}>();

const editing = ref(false);
const newName = ref(item.value.name ?? '');

const deleteItemOpened = ref(false);
const deleteItemObject = ref({} as Item);
let deleteCB: () => void;

function edit(): void {
  editing.value = true;
}

function doneEdit(): void {
  editing.value = false;
  item.value.name = newName.value;
  updateItem(zettel.value.owner, zettel.value.id, item.value);
}

function deleteIt(): void {
  deleteItem(zettel.value.owner, zettel.value.id, item.value.id);
  emit('notify', 'Removed item...');
}

function slideLeft({ reset }: { reset: () => void }): void {
  //mark done
  if (item.value.done) {
    markItemDone(zettel.value.owner, zettel.value.id, item.value.id, false).then(reset);
  } else {
    markItemDone(zettel.value.owner, zettel.value.id, item.value.id).then(reset);
  }
}

function slideRight({ reset }: { reset: () => void }): void {
  //delete item
  deleteItemOpened.value = true;
  deleteItemObject.value = item.value;
  deleteCB = reset;
}

function deleteItemAfterDialog() {
  deleteItem(zettel.value.owner, zettel.value.id, deleteItemObject.value.id).then(closeDeleteItemDialog);
}

function closeDeleteItemDialog() {
  deleteCB();
  deleteItemOpened.value = false;
  deleteItemObject.value = {} as Item;
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
</style>
