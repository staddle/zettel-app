import { defineStore } from 'pinia';
import { User } from 'src/model/User';
import { User as FirebaseUser } from 'firebase/auth';
import { firebaseAuth } from 'src/boot/firebase';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', {
  state: () => ({
    signedIn: false,
    user: {} as User,
    alerts: false,
  }),
  getters: {
    uid: (user) => user.user.uid,
    hasUserAlerts: (user) => user.alerts,
  },
  actions: {
    logIn(newUser: User) {
      this.user = newUser;
      this.signedIn = true;
    },
    logInFirebase(newUser: FirebaseUser) {
      this.user = {
        uid: newUser.uid,
        displayName: newUser.displayName,
        email: newUser.email,
        photoURL: newUser.photoURL,
      } as User;
      this.signedIn = true;
    },
    logOut() {
      firebaseAuth.signOut();
      this.signedIn = false;
      this.user = {} as User;
    },
  },
});
