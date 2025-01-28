import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.provide('apiAddress', 'http://localhost:5053')

app.mount('#app')