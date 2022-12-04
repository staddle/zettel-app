import { defineStore } from 'pinia';
import { getStores, getUserStores } from 'src/assets/ZettelActions';
import { Store } from 'src/model/Zettel';

export const useStoresStore = defineStore('store', {
  state: () => ({
    stores: new Set<Store>(),
  }),
  getters: {
    getStores(): Store[] {
      return Array.from(this.stores);
    },
  },
  actions: {
    keepUpdatingStores(uid: string): void {
      getStores((s) => {
        s.forEach((el) => this.stores.add(el));
      });
      getUserStores(uid, (s) => {
        s.forEach((el) => this.stores.add(el));
      });
    },
  },
});
