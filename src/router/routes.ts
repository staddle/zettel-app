import { RouteRecordRaw } from 'vue-router';
import MainLayout from 'layouts/MainLayout.vue';
import SignInPage from 'pages/SignInPage.vue';
import SignInSuccessPage from 'pages/SignInSuccessPage.vue';
import DrawerPage from 'pages/DrawerPage.vue';
import ZettelPage from 'pages/ZettelPage.vue';
import ErrorNotFound from 'pages/ErrorNotFound.vue';
import ZettelLayout from 'src/layouts/ZettelLayout.vue';
import NotImplementedPage from 'src/pages/NotImplementedPage.vue';
import ProfilePage from 'src/pages/ProfilePage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'Home', component: DrawerPage },
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
        path: '/search',
        name: 'Search',
        component: NotImplementedPage,
      },
      {
        path: '/user',
        name: 'User',
        component: ProfilePage,
      },
      {
        path: '/zettel',
        name: 'Zettel',
        children: [
          {
            path: '',
            name: 'Drawer',
            component: DrawerPage,
          },
          {
            path: ':zettelID',
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
