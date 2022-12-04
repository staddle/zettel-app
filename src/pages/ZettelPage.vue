<template>
  <div class="column full-width full-height">
    <div v-if="!zettel.items || zettel.items?.length == 0" class="column flex-center q-mt-lg non-selectable noItems">
      <q-icon name="block" size="60px" />
      <span>No items found.</span>
    </div>
    <div class="zettel-item" v-for="item in zettel.items" :key="item.id">
      <ZettelItem :item="item" @on-edit="onEdit(item)" @on-delete="onRemove(item)" />
    </div>

    <!--sticky button-->
    <q-page-sticky position="bottom-right" :offset="[24, 24]">
      <q-btn fab push icon="add" color="accent" @click="newItem()" :disable="editing" />
    </q-page-sticky>

    <!--Dialogs-->
    <q-dialog v-model="deleteDialogOpened">
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

    <NewZettelItem
      :opened="editing || firstEditing"
      :item="editingItem"
      @on-done="onDone()"
      @on-close="onClose()"
      @on-remove="onRemove(editingItem)"
    />
  </div>
</template>

<script setup lang="ts">
import ZettelItem from 'src/components/ZettelItem.vue';
import NewZettelItem from 'src/components/NewZettelItem.vue';
import { Item, Zettel } from 'src/model/Zettel';
import { inject, ref, Ref, watch } from 'vue';
import * as ZettelActions from 'assets/ZettelActions';
import { useUserStore } from 'src/stores/userStore';
import { deleteItem } from 'assets/ZettelActions';

const zettel: Ref<Zettel> = inject('zettel') as Ref<Zettel>;
const editingItem = ref({} as Item);
const editing = ref(false);
const firstEditing = ref(false);
const deleteDialogOpened = ref(false);
const deleteItemObject = ref({} as Item);

async function newItem() {
  if (!editing.value) {
    ZettelActions.newItem(useUserStore().user.uid, zettel.value.id).then((item) => {
      editingItem.value = item;
      firstEditing.value = true;
    });
  }
}

function onEdit(item: Item): void {
  editing.value = true;
  editingItem.value = item;
}

function onDone(): void {
  editing.value = false;
  if (firstEditing.value) firstEditing.value = false;
}

function onClose(): void {
  if (firstEditing.value) {
    deleteItem(zettel.value.owner, zettel.value.id, editingItem.value.id);
    firstEditing.value = false;
  } else {
    editing.value = false;
  }
}

function onRemove(item: Item): void {
  deleteDialogOpened.value = true;
  deleteItemObject.value = item;
}

function deleteItemAfterDialog() {
  deleteItem(zettel.value.owner, zettel.value.id, deleteItemObject.value.id).then(closeDeleteItemDialog);
}

function closeDeleteItemDialog() {
  deleteDialogOpened.value = false;
  deleteItemObject.value = {} as Item;
  editing.value = false;
  editingItem.value = {} as Item;
  if (firstEditing.value) firstEditing.value = false;
}
</script>

<style>
.noItems {
  color: #bbb;
}

.item-separator {
  margin: 0 0 0 0;
  border-color: #bbb;
}

zettel-item:last-of-type .item-separator {
  display: none;
}
</style>
