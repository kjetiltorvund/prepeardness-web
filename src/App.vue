<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import Toast from 'primevue/toast'
import AppSidebar from '@/components/AppSidebar.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

const route = useRoute()
const isMobile = useMediaQuery('(max-width: 768px)')
const menuVisible = ref(false)

// Close the mobile menu if the window grows past the breakpoint
watch(isMobile, (mobile) => {
  if (!mobile) menuVisible.value = false
})
</script>

<template>
  <Toast />

  <RouterView v-if="route.meta.public" />

  <div v-else class="layout">
    <aside v-if="!isMobile" class="sidebar">
      <AppSidebar />
    </aside>

    <template v-else>
      <header class="topbar">
        <Button icon="pi pi-bars" text aria-label="Åpne meny" @click="menuVisible = true" />
        <span class="topbar-title">Beredskapslager</span>
      </header>
      <Drawer v-model:visible="menuVisible" position="left" class="menu-drawer" :show-close-icon="false">
        <AppSidebar @navigate="menuVisible = false" />
      </Drawer>
    </template>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  position: sticky;
  top: 0;
  flex: 0 0 15rem;
  height: 100vh;
  border-right: 1px solid var(--p-content-border-color);
  background-color: var(--p-content-background);
}

.content {
  flex: 1;
  min-width: 0;
  padding: 1.5rem;
}

.topbar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 3.5rem;
  padding: 0 0.5rem;
  border-bottom: 1px solid var(--p-content-border-color);
  background-color: var(--p-content-background);
}

.topbar-title {
  font-weight: 600;
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  .content {
    padding: calc(3.5rem + 1rem) 1rem 1rem;
  }
}
</style>

<style>
/* The drawer is teleported to body, so this can't be scoped */
.menu-drawer.p-drawer {
  width: 16rem;
}

.menu-drawer .p-drawer-header {
  display: none;
}

.menu-drawer .p-drawer-content {
  padding: 0;
}
</style>
