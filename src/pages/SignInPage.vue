<template>
  <div class="column justify-center items-center">
    <h2>Sign in</h2>
    <div id="firebaseui-auth-container"></div>
  </div>
</template>

<script setup lang="ts">
import { mountSignIn } from 'boot/firebase';
import { onMounted } from 'vue';

// The start method will wait until the DOM is loaded.
onMounted(() => mountSignIn());
</script>
