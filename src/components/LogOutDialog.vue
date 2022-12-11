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
import { useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/userStore';
import { toRefs } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{ opened: boolean }>();
const { opened } = toRefs(props);

const router = useRouter();
const $q = useQuasar();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function close() {
  emit('close');
}

function logOut() {
  useUserStore().logOut();
  close();
  router.push('/');
  $q.notify({
    message: 'Logged out',
    color: 'accent',
    position: 'top',
    timeout: 2000,
  });
}
</script>

<style></style>
