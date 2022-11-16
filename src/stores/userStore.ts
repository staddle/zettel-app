import { defineStore } from 'pinia';
import { User } from 'src/model/User';

export const useUserStore = defineStore('user', {
  state: () => ({
    signedIn: false,
    user: {} as User,
  }),
  getters: {
    uid: (user) => user.user.uid,
  },
  actions: {
    logIn(newUser: User) {
      this.user = newUser;
      this.signedIn = true;
    },
    logOut() {
      this.signedIn = false;
      this.user = {} as User;
    },
  },
});
