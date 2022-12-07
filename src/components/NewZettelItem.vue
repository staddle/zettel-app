<template>
  <q-dialog v-model="dialogOpen" @hide="onHide()" position="bottom" :persistent="false">
    <q-card>
      <q-card-section>
        <form
          class="row items-center justify-between full-width no-wrap"
          @submit.prevent.stop="onSubmit()"
          @reset.prevent.stop="onReset()"
        >
          <div class="full-width q-pr-sm">
            <q-input
              ref="nameInput"
              v-model="newName"
              class="full-width"
              autofocus
              label="Name"
              :rules="[(val) => (val && val.length > 1) || 'Please give a name.']"
              maxlength="64"
            >
              <template v-slot:before>
                <q-icon name="description" />
              </template>
            </q-input>
            <q-select v-model="newStore" :options="stores" option-label="name" label="Store">
              <template v-slot:before>
                <q-icon name="local_grocery_store" />
              </template>

              <template v-slot:after>
                <q-btn round dense flat icon="add" @click.prevent="addStore()" />
              </template>
            </q-select>
          </div>
          <div class="column">
            <q-btn color="primary" padding="sm" push icon="done" type="submit" class="q-mb-md"></q-btn>
            <q-btn color="primary" padding="sm" push icon="delete" @click="remove()"></q-btn>
          </div>
          <q-btn class="absolute close-button" flat round icon="close" type="reset"></q-btn>
        </form>
      </q-card-section>
    </q-card>
  </q-dialog>
  <NewStore :opened="addStoreOpen" @set-opened="(o) => (addStoreOpen = o)" />
</template>

<script lang="ts" setup>
import NewStore from './NewStore.vue';
import { updateItem, updateZettelIDB } from 'src/assets/ZettelActions';
import { Item, Store, Zettel } from 'src/model/Zettel';
import { useStoresStore } from 'src/stores/storesStore';
import { inject, Ref, ref, toRefs, watch } from 'vue';
import { useUserStore } from 'src/stores/userStore';

const props = defineProps<{ opened: boolean; item: Item }>();
const { opened, item } = toRefs(props);

watch(opened, (newOpened) => {
  dialogOpen.value = newOpened;
});

watch(item, (newItem) => {
  if (newItem) {
    newName.value = newItem.name;
    newStore.value = newItem.store;
  }
});

const dialogOpen = ref(opened.value);
const zettel: Ref<Zettel> = inject('zettel') as Ref<Zettel>;
const nameInput = ref(null);
const newName = ref(item.value.name ?? '');
const newStore: Ref<Store | null> = ref(item.value.store ?? null);
const userStore = useUserStore();
const stores = inject('stores') as Ref<Store[]>;
const addStoreOpen = ref(false);

const emit = defineEmits<{
  (e: 'onDone'): void;
  (e: 'onClose'): void;
  (e: 'onRemove'): void;
}>();

function onHide() {
  emit('onClose');
}

function onSubmit(): void {
  nameInput.value.validate();
  if (nameInput.value.hasError) {
    return;
  } else {
    item.value.name = newName.value;
    if (newStore.value) item.value.store = newStore.value;
    if (userStore.signedIn) {
      updateItem(zettel.value.owner, zettel.value.id, item.value).then(() => {
        emit('onDone');
      });
    } else {
      const clonedZettel: Zettel = JSON.parse(JSON.stringify(zettel.value));
      const clonedItem: Item = JSON.parse(JSON.stringify(item.value));
      clonedZettel.items = clonedZettel.items.map((i) => (i.id === clonedItem.id ? clonedItem : i));
      updateZettelIDB(clonedZettel).then(() => {
        emit('onDone');
      });
    }
  }
}

function onReset(): void {
  emit('onClose');
}

function remove(): void {
  emit('onRemove');
}

function addStore() {
  addStoreOpen.value = true;
}
</script>

<style></style>
