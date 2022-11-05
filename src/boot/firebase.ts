import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../assets/firebaseConfig';
import {
  connectAuthEmulator,
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth';
import {
  connectDatabaseEmulator,
  getDatabase,
  push,
  ref,
  set,
} from 'firebase/database';
import * as firebaseui from 'firebaseui';
import { User } from 'src/model/User';

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firebaseDatabase = getDatabase(firebaseApp);

const googleProvider = new GoogleAuthProvider();
const emailProvider = new EmailAuthProvider();

if (location.hostname === 'localhost') {
  // Point to the RTDB emulator running on localhost.
  connectDatabaseEmulator(firebaseDatabase, 'localhost', 9001);
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099');
}

const uiConfig = {
  signInSuccessUrl: '/',
  callbacks: {
    signInSuccessWithAuthResult: function (
      authResult: UserCredential
    ): boolean {
      set(ref(firebaseDatabase, `users/${authResult.user.uid}`), {
        displayName: authResult.user.displayName,
        email: authResult.user.email,
        photoURL: authResult.user.photoURL,
      } as User);
      return true;
    },
  },
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    googleProvider.providerId,
    //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    //firebase.auth.GithubAuthProvider.PROVIDER_ID,
    emailProvider.providerId,
    //firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    //firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  // tosUrl and privacyPolicyUrl accept either url string or a callback
  // function.
  // Terms of service url/callback.
  tosUrl: '<your-tos-url>',
  // Privacy policy url/callback.
  privacyPolicyUrl: function () {
    window.location.assign('<your-privacy-policy-url>');
  },
};

// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebaseAuth);

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  // Import the functions you need from the SDKs you need
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Initialize Firebase
  app.config.globalProperties.$firebase = firebaseApp;
});

function mountSignIn() {
  ui.start('#firebaseui-auth-container', uiConfig);
}

export { firebaseApp, firebaseAuth, firebaseDatabase, mountSignIn };
