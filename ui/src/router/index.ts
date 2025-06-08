import { createRouter, createWebHistory } from 'vue-router';
import HigherOrLower from '../views/HigherOrLower.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'higher-or-lower',
      component: HigherOrLower,
    },
    // Redirect any other paths to the main game
    {
      path: '/:catchAll(.*)',
      redirect: '/'
    }
  ],
});

export default router;
