<template>
  <div>
    <div class="q-mt-md q-mx-md">
      <span class="text-h4">{{ signedIn ? user.displayName : 'Profile' }}</span>
      <div class="q-mt-md button-group">
        <div>
          <span class="text-body1">Appearance</span>
          <q-separator />
          <div class="text-body2 option q-ma-sm">
            <span>UI Mode</span>
            <q-btn-toggle
              v-model="darkMode"
              push
              :toggle-color="darkMode ? 'grey-9' : 'yellow-8'"
              :options="[
                { value: false, slot: 'one' },
                { value: true, slot: 'two' },
              ]"
            >
              <template v-slot:one>
                <q-icon name="light_mode" />
              </template>
              <template v-slot:two>
                <q-icon name="dark_mode" />
              </template>
            </q-btn-toggle>
          </div>
          <span class="text-body1">Behavior</span>
          <q-separator />
          <div class="text-body2 option q-ma-sm">
            <span>Cloud sync</span>
            <q-btn push icon="login" label="Login" color="accent" @click="goToSignIn()" />
          </div>
        </div>
        <q-btn v-if="signedIn" icon="logout" color="accent" push label="Log out" @click="logOut()" style="bottom: 0" />
      </div>
    </div>
    <LogOutDialog :opened="logOutDialogOpened" @close="closeLogOutDialog()" />
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from 'src/stores/userStore';
import { useRouter } from 'vue-router';
import LogOutDialog from 'src/components/LogOutDialog.vue';
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';

const user = useUserStore().user;
const signedIn = useUserStore().signedIn;
const router = useRouter();

const $q = useQuasar();
const darkMode = ref($q.dark.isActive);
const logOutDialogOpened = ref(false);

watch(darkMode, (value) => {
  $q.dark.set(value);
});

function goToSignIn() {
  router.push('/sign-in');
}

function logOut() {
  logOutDialogOpened.value = true;
}

function closeLogOutDialog() {
  logOutDialogOpened.value = false;
}
</script>

<style lang="scss">
.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.body--dark {
  & .q-btn-group {
    & button:first-of-type {
      background-color: rgb(35, 35, 35);
    }
  }
}
</style>
