<template>
  <q-dialog v-model="opened">
    <q-card>
      <q-card-section>Are you sure you want to log out?</q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close()" />
        <q-btn flat label="Log Out" color="accent" @click="logOut()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useUserStore } from 'src/stores/userStore';
import { toRefs } from 'vue';

const props = defineProps<{ opened: boolean }>();
const { opened } = toRefs(props);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function close() {
  emit('close');
}

function logOut() {
  useUserStore().logOut();
  close();
}
</script>

<style></style>
