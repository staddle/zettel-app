# 📝Zettel-App

Check it out at [zettel.cybershit.de](https://zettel.cybershit.de)

A progressive web app (PWA) for keeping track of your groceries and where to buy them.  
* 🛒 Keep track of your groceries
* 🏪 Save where you want to buy your groceries
* 🌐 Available online & offline
* ☁️ Cloud sync when logged in to multiple devies

## 📱 PWA?
A PWA is a website that can be installed to your device like a native app via the browser's PWA features. This will render the website inside your browser even when **offline**. This project is designed with mobile-first in mind, so don't give the desktop design too much thought. (:

## ✨ Feature List
### Available Features
* Track your groceries on a _Zettel_ ("note" in German, i.e. a shopping list)
* Manage multiple Zettels for different households / occasions
* Add multiple items (groceries) to a Zettel
  * Mark them as 'done'
  * Delete them
  * Change their name
  * Choose in which store to buy them
  * Filter your items by name or creation date
  * Choose to display done items or to hide them
* Add multiple stores to your store list which will appear when creating a new item
* Light + Dark mode option
* Online / Offline support 
  * Online: Google realtime database (RTDB) for cloud sync 
  * Offline: IndexedDB that is built in modern web browsers

### Planned Updates
* Zettels created offline should be synced to the cloud when logged in afterwards
* Sharing of Zettels and support of multiple people adding groceries to the same list
* Managing / Filtering of Zettels on the home page
* Filtering of stores in the profile page
* Finding other users / popular Zettels

## 👷‍♂️ Technical Challenges
### Firebase
Sign-in page via [firebase-ui](https://firebase.google.com/docs/auth/web/firebaseui). Simply setup the config and call the start() function:
```js
function mountSignIn() {
  ui.start('#firebaseui-auth-container', uiConfig);
}
```

RTDB usage via:  
1. Initialize firebase in a boot file (see [firebase.ts](src/boot/firebase.ts))
2. return `firebaseDb` object to any file manipulating data
3. use following syntax:
```js
// Retrieving data once
get(ref(firebaseDb, `path/to/db/with/${variable}`).then((snapshot) => {
  if (snapshot.exists()) {
    handle(snapshot.val())
  }
});

// Getting updates when data changes
onValue(ref(firebaseDb, `path/to/db/with/${variable}`, (snapshot) => {
  if (snapshot.exists()) {
    handle(snapshot.val())
  }
});

// Pushing data
const someObject = { data: 'someData' }
const pushRef = push(ref(firebaseDb, `path/to/db/with/${variable}`);
const idOfNewItem = pushRef.key;
set(pushRef, someObject);
```

### IndexedDB
To have the app available and usable even when no internet connection is available, Zettel-App uses the _IndexedDB_ feature in your browser. This is database for large amounts of structured data. As Cookies and Local Storage (the other options for saving data permanently in the browser) only save key-value pairs as strings, IndexedDB is the best option for this kind of application as it allows for the most DB-like experience.  

First of all, a new DB has to be created via an upgrade transaction (from [indexedDBSync.ts](src/boot/indexedDBSync.ts)). DBs have version numbers to indicate what state of the model they represent. If the app says to use a newer version number, the browser will start the upgrade transaction. Via the `event.oldVersion` key one can check what needs to be added to the current DB to upgrade it. The following code uses a `Promise` to return the reference to the db. This promise can be exported to any files manipulating data in the DB. This way, the manipulation can only begin, when the DB is retrieved and upgraded to the newest version.
```js
let idb; //save the db reference for later use
const request = indexedDB.open(dbName, versionNumber);
const dbPromise = new Promise((resolve, reject) => {
  request.onupgradeneeded = (event) => {
    const localDB = event.target.result;
    const tx = event.target.transaction;
    if (event.oldVersion < 1) { /
      const zettelStore = localDB.createObjectStore('zettels', { keyPath: 'id' });
      zettelStore.createIndex('owner', 'owner', { unique: false });
    }
    if (event.oldVersion < 2) { 
      localDB.createObjectStore('stores', { keyPath: 'id' });
    }

    tx.oncomplete = () => resolve(localDB);
  };

  request.onsuccess = (event) => {
    resolve(event.target.result as IDBDatabase);
  };
});
dbPromise.then((db) => {
  idb = db;
});
```
To manipulate data in the IndexedDB, I created the following function to encapsulate the requests:
```js
function idbOperation(
  storeName: string,
  operation: IDBOperation,
  data: object = undefined,
  id: string = null
): Promise<void | object> {
  return getIdb().then((db) => {
    const tx: IDBTransaction = db.transaction(storeName, operation == IDBOperation.GET ? 'readonly' : 'readwrite');
    const idbStore: IDBObjectStore = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      let request: IDBRequest;
      switch (operation) {
        case IDBOperation.GET:
          if (id) request = idbStore.get(id);
          else request = idbStore.getAll();
          break;
        case IDBOperation.ADD:
          request = idbStore.add(data);
          break;
        case IDBOperation.REMOVE:
          request = idbStore.delete(id);
          break;
        case IDBOperation.UPDATE:
          request = idbStore.put(data);
          break;
      }
      request.onerror = (event) => {
        console.log(`Error performing operation ${operation} on indexedDB`, event);
        reject(`Error performing operation ${operation} on indexedDB`);
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  });
}
```

To use this function, check the following code examples:
```js
// This emulates the onValue() function from RTDB. 
// Any time a manipulation is done to the Zettels, this list of callbacks is called to notify of the updated data.
const zettelsCallbackList = [];

export function onZettelListIDB(callback: (zettels: Zettel[]) => void): void {
  zettelsCallbackList.push(callback);
  getZettelsFromIDB().then((zettels) => callback(zettels));
}

// Retrieve data once:
export async function getZettelsFromIDB(): Promise<Zettel[]> {
  return idbOperation('zettels', IDBOperation.GET);
}

// Push data:
export async function addZettelToIDB(title: string): Promise<void> {
  return idbOperation('zettels', IDBOperation.ADD, {
    id: getID(),
    title,
    items: [] as Item[],
    owner: '0',
  } as Zettel).then(notifyZettelsCallbacks);
}

// Delete data:
export async function removeZettelFromIDB(id: string): Promise<void> {
  return idbOperation('zettels', IDBOperation.REMOVE, {}, id).then(notifyZettelsCallbacks);
}

// Update data
export async function updateZettelIDB(zettel: Zettel): Promise<void> {
  return idbOperation('zettels', IDBOperation.UPDATE, zettel).then(notifySingleZettelCallbacks(zettel.id));
}
```

## 🛠️ Installation
### Install the dependencies
```bash
yarn
# or
npm install
```

### (Optional) Install and init [Firebase](https://firebase.google.com/docs/emulator-suite/install_and_configure) if you want authentication and RTDB support
```bash
npm i firebase
firebase init
firebase init emulators
```

### Start the app in development mode (hot-code reloading, error reporting, etc.) + firebase emulators
```bash
quasar dev
firebase emulators:start
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Format the files
```bash
yarn format
# or
npm run format
```



### Build the app for production (PWA mode)
```bash
quasar build -m pwa
```
