import { createRouter, createWebHistory } from 'vue-router'
import ShaderDemo from '../components/ShaderDemo.vue'
import QuestionReady from '../Question_ready.vue'
import Login from '../Login.vue'
import Interview from '../Interview.vue'
import Result from '../Result.vue'

const routes = [
  { path: '/', component: ShaderDemo }, // ✅ 기본 진입점
  { path: '/question-ready', component: QuestionReady },
  { path: '/login', component: Login },
  { path: '/interview', component: Interview },
  { path: '/result', component: Result },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
