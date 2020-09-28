import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import firebase from 'firebase';

Vue.use(VueRouter);

const firebaseConfig = {
  apiKey: "AIzaSyCbTPzFJfKSnxkF7-_tOIORSBHJCVgb8ss",
  authDomain: "synplay-3031f.firebaseapp.com",
  databaseURL: "https://synplay-3031f.firebaseio.com",
  projectId: "synplay-3031f",
  storageBucket: "synplay-3031f.appspot.com",
  messagingSenderId: "395787542172",
  appId: "1:395787542172:web:3921c0fd183c272e9dd759",
  measurementId: "G-YVXR1595YG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/video/:id',
    name: 'video_page',
    component: () => import('../views/Video.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
