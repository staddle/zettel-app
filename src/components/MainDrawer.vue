<template>
  <div class="">
    <div
      v-if="userName != ''"
      class="column items-center q-pt-md justify-between"
    >
      <span>Hello, {{ userName }}!</span>
      <q-btn
        color="accent"
        icon="fas fa-right-from-bracket"
        label="Sign out"
        @click="signOut()"
      />
    </div>
    <div v-else class="column items-center q-pt-md justify-between">
      <span>Please sign in below</span>
      <router-link to="/sign-in">
        <q-btn color="accent" icon="fas fa-right-to-bracket" label="Sign In" />
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue';
import { firebaseAuth } from 'boot/firebase';

export interface Props {
  userName: string;
}

const props = defineProps<Props>();

const { userName } = toRefs(props);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

async function signOut() {
  await firebaseAuth.signOut();
  emit('close');
}
</script>
