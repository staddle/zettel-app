import { defineStore } from 'pinia';
import { getStores as getDefaultStores, getUserStores, onStoresIDB } from 'src/assets/ZettelActions';
import { Store } from 'src/model/Zettel';
import { onMounted } from 'vue';
import { useUserStore } from './userStore';

const storeUpdateCallbacks = [] as ((s: Store[]) => void)[];
const userStore = useUserStore();

function notifyAllStoreCallbacks(): void {
  storeUpdateCallbacks.forEach((callback) => callback(useStoresStore().getStores));
}

onMounted(() => {
  const storesStore = useStoresStore(); //TODO what if user signs in after this?
  if (userStore.signedIn) {
    getDefaultStores((s) => {
      storesStore.defaultStores = s;
      notifyAllStoreCallbacks();
    });
    getUserStores(userStore.uid, (s) => {
      storesStore.stores = s;
      notifyAllStoreCallbacks();
    });
  } else {
    onStoresIDB((s: Store[]) => {
      storesStore.stores = s;
      notifyAllStoreCallbacks();
    });
  }
});

export const useStoresStore = defineStore('store', {
  state: () => ({
    stores: [] as Store[],
    defaultStores: [] as Store[],
  }),
  getters: {
    getStores(): Store[] {
      return this.stores.concat(this.defaultStores);
    },
  },
  actions: {
    keepUpdatingStores(uid: string, callback: (s: Store[]) => void): void {
      storeUpdateCallbacks.push(callback);
      callback(this.getStores);
    },
  },
});
