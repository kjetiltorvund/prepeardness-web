<template>
  <nav class="app-sidebar">
    <div class="brand">
      <i class="pi pi-box" />
      <span>Beredskapslager</span>
    </div>

    <ul class="nav-links">
      <li v-for="link in links" :key="link.to">
        <RouterLink :to="link.to" class="nav-link" @click="emit('navigate')">
          <i :class="link.icon" />
          <span>{{ link.label }}</span>
        </RouterLink>
      </li>
    </ul>

    <div class="account">
      <span v-if="user" class="account-name">{{ user.name ?? user.email }}</span>
      <Button label="Logg ut" icon="pi pi-sign-out" size="small" text @click="onSignOut" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { RouterLink, useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'
import { useUserStore } from '@/stores/users'

const emit = defineEmits<{ navigate: [] }>()

const links = [
  { to: '/', label: 'Varer', icon: 'pi pi-shopping-cart' },
  { to: '/users', label: 'Brukere', icon: 'pi pi-users' },
]

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const inventoryStore = useInventoryStore()
const userStore = useUserStore()
const router = useRouter()

async function onSignOut() {
  emit('navigate')
  await authStore.signOut()
  inventoryStore.reset()
  userStore.reset()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  padding: 1.25rem 0.75rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--p-border-radius-md, 6px);
  color: var(--p-text-color);
}

.nav-link:hover {
  background-color: var(--p-content-hover-background);
}

.nav-link.router-link-exact-active {
  background-color: var(--p-highlight-background);
  color: var(--p-highlight-color);
  font-weight: 600;
}

.account {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  margin-top: auto;
  padding: 0 0.75rem;
  font-size: 0.9rem;
}

.account-name {
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
