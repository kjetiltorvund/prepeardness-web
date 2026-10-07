<template>
  <div class="login">
    <h1>Beredskapslager</h1>
    <p>Logg inn med Google-kontoen din for å fortsette.</p>

    <div ref="buttonContainer" class="google-button" />

    <Message v-if="error" severity="error">{{ error }}</Message>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Message from 'primevue/message'
import { renderGoogleButton } from '@/services/googleAuth'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const buttonContainer = ref<HTMLElement | null>(null)
const error = ref<string | null>(null)

function redirectTarget() {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
}

watch(
  () => authStore.token,
  () => {
    if (authStore.hasValidToken()) router.replace(redirectTarget())
  },
)

onMounted(async () => {
  try {
    await renderGoogleButton(buttonContainer.value!)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Kunne ikke laste Google-innlogging'
  }
})
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 1rem;
  text-align: center;
}

.google-button {
  min-height: 44px;
}
</style>
