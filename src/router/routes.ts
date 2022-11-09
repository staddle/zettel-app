import { RouteRecordRaw } from 'vue-router';
import MainLayout from 'layouts/MainLayout.vue';
import IndexPage from 'pages/IndexPage.vue';
import SignInPage from 'pages/SignInPage.vue';
import SignInSuccessPage from 'pages/SignInSuccessPage.vue';
import DrawerPage from 'pages/DrawerPage.vue';
import ZettelPage from 'pages/ZettelPage.vue';
import ErrorNotFound from 'pages/ErrorNotFound.vue';
import ZettelLayout from 'src/layouts/ZettelLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'Home', component: IndexPage },
      {
        path: '/sign-in',
        name: 'SignIn',
        component: SignInPage,
      },
      {
        path: '/success',
        name: 'SignInSuccess',
        component: SignInSuccessPage,
      },
      {
        path: '/drawer',
        name: 'Drawer',
        component: DrawerPage,
      },
      {
        path: '/zettel/:zettelID',
        component: ZettelLayout,
        props: true,
        children: [
          {
            path: '',
            name: 'Zettel',
            component: ZettelPage,
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: ErrorNotFound,
  },
];

export default routes;
