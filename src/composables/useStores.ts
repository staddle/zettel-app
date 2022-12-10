import { onAuthStateChanged } from '@firebase/auth';
import { getUserStores, onStoresIDB, getStores as getDefaultStores } from 'src/assets/ZettelActions';
import { firebaseAuth } from 'src/boot/firebase';
import { Store } from 'src/model/Zettel';
import { ref } from 'vue';

export function useStores() {
  const storeUpdateCallbacks = [] as ((s: Store[]) => void)[];
  const stores = ref([] as Store[]);
  const defaultStores = ref([] as Store[]);
  const uid = ref('');

  onAuthStateChanged(firebaseAuth, (user) => {
    if (user) {
      uid.value = user.uid;
    } else {
      uid.value = '';
    }
    subscribe();
  });

  function getStores(): Store[] {
    return stores.value.concat(defaultStores.value);
  }

  function notifyAllStoreCallbacks(): void {
    storeUpdateCallbacks.forEach((callback) => callback(getStores()));
  }

  function onStores(callback: (s: Store[]) => void): void {
    storeUpdateCallbacks.push(callback);
    callback(getStores());
  }

  function subscribe() {
    if (uid.value != '') {
      console.log('online');
      getDefaultStores((s) => {
        defaultStores.value = s;
        notifyAllStoreCallbacks();
      });
      getUserStores(uid.value, (s) => {
        stores.value = s;
        notifyAllStoreCallbacks();
      });
    } else {
      console.log('offline');
      onStoresIDB((s: Store[]) => {
        stores.value = s;
        notifyAllStoreCallbacks();
      });
    }
  }

  return { stores, defaultStores, getStores, onStores };
}
