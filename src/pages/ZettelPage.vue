<template>
  <div class="column full-width full-height bg-custom">
    <div v-if="!zettel.items || zettel.items?.length == 0" class="column flex-center q-mt-lg non-selectable noItems">
      <q-icon name="block" size="60px" />
      <span>No items found.</span>
    </div>
    <div class="items-container">
      <div class="zettel-item" v-for="item in zettel.items" :key="item.id">
        <ZettelItem :item="item" @on-edit="onEdit(item)" @on-delete="(cb) => onRemove(item, cb)" />
      </div>
    </div>

    <!--sticky button-->
    <q-page-sticky position="bottom-right" :offset="[16, 16]">
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

const zettel: Ref<Zettel> = inject('zettel') as Ref<Zettel>;
const editingItem = ref({} as Item);
const editing = ref(false);
const firstEditing = ref(false);
const deleteDialogOpened = ref(false);
const deleteItemObject = ref({} as Item);
const deleteCallback: Ref<() => void> = ref(() => {
  /**/
});

const userStore = useUserStore();

async function newItem() {
  if (!editing.value) {
    if (userStore.signedIn) {
      ZettelActions.newItem(userStore.user.uid, zettel.value.id).then((item) => {
        editingItem.value = item;
        firstEditing.value = true;
      });
    } else {
      const newItem = {
        id: ZettelActions.getID(),
      } as Item;
      const zettelClone = JSON.parse(JSON.stringify(zettel.value));
      if (!zettelClone.items) zettelClone.items = [];
      zettelClone.items.push(newItem);
      ZettelActions.updateZettelIDB(zettelClone).then(() => {
        editingItem.value = newItem;
        firstEditing.value = true;
      });
    }
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
    deleteItem(editingItem.value).then(() => {
      firstEditing.value = false;
    });
  } else {
    editing.value = false;
  }
}

function onRemove(item: Item, cb: () => void): void {
  deleteDialogOpened.value = true;
  deleteItemObject.value = item;
  deleteCallback.value = cb;
}

function deleteItemAfterDialog() {
  deleteItem(deleteItemObject.value).then(closeDeleteItemDialog);
}

async function deleteItem(item: Item): Promise<void> {
  if (userStore.signedIn) {
    return ZettelActions.deleteItem(zettel.value.owner, zettel.value.id, item.id);
  } else {
    const zettelClone = JSON.parse(JSON.stringify(zettel.value));
    zettelClone.items = zettelClone.items.filter((i: Item) => i.id != item.id);
    return ZettelActions.updateZettelIDB(zettelClone);
  }
}

function closeDeleteItemDialog() {
  deleteDialogOpened.value = false;
  deleteItemObject.value = {} as Item;
  editing.value = false;
  editingItem.value = {} as Item;
  if (firstEditing.value) firstEditing.value = false;
  deleteCallback.value();
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

.zettel-item:last-of-type .item-separator {
  display: none;
}

.items-container {
  border-radius: 0.7rem 0.7rem 0 0;
  overflow: hidden;
}
.bg-custom {
  background-color: var(--q-primary);
}
.body--dark .bg-custom {
  background-color: #ffffff0c;
}
</style>
