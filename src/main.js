import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import 'windi.css'
import '@/assets/styles/main.scss'

createApp(App).use(store).mount('#app')
