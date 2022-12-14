<template>
  <div class="width-full">
    <q-slide-item class="full-width" left-color="positive" right-color="negative" @left="slideLeft" @right="slideRight">
      <template v-slot:left>
        <q-icon name="done" color="black" />
      </template>
      <template v-slot:right>
        <q-icon name="delete" />
      </template>
      <q-item-section :class="{ done: item.done, 'bg-white': !$q.dark.isActive, 'bg-dark-page': $q.dark.isActive }">
        <div class="row q-pa-sm items-center title q-ml-md">
          <div class="name text-body1">
            {{ item.name && item.name != '' ? item.name : 'No Name' }}
            <q-popup-edit v-model="newName" touch-position auto-save v-slot="scope" @save="(v, iv) => submitNewName(v)">
              <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" label="Name" />
            </q-popup-edit>
          </div>
          <div class="q-pl-sm store text-body2 text-grey-8">
            in {{ item.store?.name ?? 'No Store' }}
            <q-popup-edit
              v-model="newStore"
              touch-position
              auto-save
              v-slot="scope"
              @save="(v, iv) => submitNewStore(v)"
            >
              <q-select
                v-model="scope.value"
                :options="stores"
                option-label="name"
                label="Store"
                dense
                class="q-ml-sm"
                @popup-hide="scope.set"
                :color="$q.dark.isActive ? 'accent' : 'primary'"
              />
            </q-popup-edit>
          </div>
        </div>
        <q-separator />
      </q-item-section>
    </q-slide-item>
  </div>
</template>

<script lang="ts" setup>
import { updateItem, markItemDone, updateZettelIDB } from 'src/assets/ZettelActions';
import { Item, Store, Zettel } from 'src/model/Zettel';
import { useUserStore } from 'src/stores/userStore';
import { inject, ref, Ref, toRefs } from 'vue';
import { useQuasar } from 'quasar';

const props = defineProps<{ item: Item }>();
const { item } = toRefs(props);
const zettel: Ref<Zettel> = inject('zettel') as Ref<Zettel>;
const stores = inject('stores') as Ref<Store[]>;
const emit = defineEmits<{
  (e: 'onEdit'): void;
  (e: 'onDelete', callback: () => void): void;
}>();
const $q = useQuasar();
const deleteItemOpened = ref(false);
const deleteItemObject = ref({} as Item);
const editing = ref('');
const newName = ref(item.value.name);
const newStore = ref(item.value.store);
const userStore = useUserStore();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function edit(): void {
  emit('onEdit');
}

function slideLeft({ reset }: { reset: () => void }): void {
  //mark done
  if (userStore.signedIn) {
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

function submitNewName(newValue: string) {
  console.log('submitting new name');
  item.value.name = newValue;
  if (userStore.signedIn) {
    updateItem(zettel.value.owner, zettel.value.id, item.value).then(() => {
      editing.value = '';
    });
  } else {
    const zettelClone = JSON.parse(JSON.stringify(zettel.value));
    zettelClone.items = zettelClone.items.map((i: Item) => {
      if (i.id == item.value.id) {
        i.name = item.value.name;
      }
      return i;
    });
    updateZettelIDB(zettelClone).then(() => {
      editing.value = '';
    });
  }
}

function submitNewStore(newValue: Store) {
  item.value.store = newValue;
  if (userStore.signedIn) {
    updateItem(zettel.value.owner, zettel.value.id, item.value).then(() => {
      editing.value = '';
    });
  } else {
    const zettelClone = JSON.parse(JSON.stringify(zettel.value));
    const storeClone = JSON.parse(JSON.stringify(newValue));
    zettelClone.items = zettelClone.items.map((i: Item) => {
      if (i.id == item.value.id) {
        i.store = storeClone;
      }
      return i;
    });
    updateZettelIDB(zettelClone).then(() => {
      editing.value = '';
    });
  }
}
</script>

<style lang="scss">
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
  background-color: rgba(0, 0, 0, 0.05);
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

.new-name {
  max-width: min(50%, 10rem);
  z-index: 2;
}
</style>
