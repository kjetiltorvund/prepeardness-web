import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config'
import Lara from '@primeuix/themes/lara'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'

import 'primeicons/primeicons.css' // icons

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, { theme: { preset: Lara } })
app.use(ToastService)
app.use(ConfirmationService)
app.use(DialogService)

app.mount('#app')
