import { defineStore } from 'pinia';
import { getStores, getUserStores, onStoresIDB } from 'src/assets/ZettelActions';
import { Store } from 'src/model/Zettel';

export const useStoresStore = defineStore('store', {
  state: () => ({
    stores: new Set<Store>(),
    storeUpdateCallbacks: [] as ((s: Store[]) => void)[],
  }),
  getters: {
    getStores(): Store[] {
      return Array.from(this.stores);
    },
  },
  actions: {
    keepUpdatingStores(uid: string, callback: (s: Store[]) => void): void {
      this.storeUpdateCallbacks.push(callback);
      if (uid !== '') {
        getStores((s) => {
          s.forEach((el) => this.stores.add(el));
          this.notifyAllStoreCallbacks();
        });
        getUserStores(uid, (s) => {
          s.forEach((el) => this.stores.add(el));
          this.notifyAllStoreCallbacks();
        });
      } else {
        onStoresIDB((s: Store[]) => {
          this.stores = new Set(s);
          this.notifyAllStoreCallbacks();
        });
      }
      callback(this.getStores);
    },
    notifyAllStoreCallbacks(): void {
      this.storeUpdateCallbacks.forEach((callback) => callback(this.getStores));
    },
  },
});
