<template>
  <q-btn flat dense rounded class="z-2">
    <q-avatar :alt="displayName" class="cursor-pointer avatar-sm" size="2rem">
      <img :src="avatar" />
    </q-avatar>
    <q-popup-proxy transition-show="flip-up" transition-hide="flip-down">
      <q-banner class="bg-primary text-white">
        <q-card flat class="bg-primary">
          <q-card-section class="text-center">
            {{ displayName }}
          </q-card-section>
          <q-card-actions>
            <q-btn align="right" color="secondary" label="Visit Profile" class="text-black" />
          </q-card-actions>
        </q-card>
      </q-banner>
    </q-popup-proxy>
  </q-btn>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';

import { User } from 'src/model/User';
import { getAvatar } from 'src/assets/UserActions';

const props = defineProps<{ user: User }>();
const { user } = toRefs(props);
const displayName = computed(() => user.value?.displayName ?? 'Anonymous');
const avatar = computed(() => {
  if (user.value != undefined) {
    if (user.value.photoURL) {
      return user.value.photoURL;
    } else {
      return getAvatar(user.value.displayName);
    }
  } else {
    return getAvatar();
  }
});
</script>

<style></style>
