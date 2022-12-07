<template>
  <q-dialog v-model="dialogOpen">
    <form @submit.prevent.stop="onSubmit()" @reset.prevent.stop="onReset()" class="z-top">
      <q-card>
        <q-card-section>
          <div class="text-h6">Add Store</div>
        </q-card-section>
        <q-card-section>
          <q-input
            ref="nameInput"
            v-model="name"
            autofocus
            label="Store"
            :rules="[(val) => val.length > 1 || 'Please give a name.']"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" type="reset" v-close-popup />
          <q-btn flat label="Add" color="primay" type="submit" v-close-popup />
        </q-card-actions>
      </q-card>
    </form>
  </q-dialog>
</template>

<script lang="ts" setup>
import { addUserStore, addStoreToIDB, getID } from 'src/assets/ZettelActions';
import { Store } from 'src/model/Zettel';
import { useUserStore } from 'src/stores/userStore';
import { ref, toRefs, watch } from 'vue';

const props = defineProps<{ opened: boolean }>();
const { opened } = toRefs(props);
const dialogOpen = ref(opened);
watch(opened, (val) => {
  dialogOpen.value = val;
});
watch(dialogOpen, (val) => {
  if (!val) {
    onReset();
  }
});
const name = ref('');
const nameInput = ref(null);

const emit = defineEmits<{
  (e: 'setOpened', newOpened: boolean): void;
}>();

function onSubmit() {
  nameInput.value.validate();
  if (nameInput.value.hasError) {
    return;
  } else {
    if (useUserStore().signedIn) {
      addUserStore(useUserStore().uid, { name: name.value } as Store).then(onReset);
    } else {
      addStoreToIDB({
        id: getID(),
        name: name.value,
      } as Store).then(onReset);
    }
  }
}

function onReset() {
  emit('setOpened', false);
}
</script>

<style>
.z-top {
  z-index: 1000;
}
</style>
