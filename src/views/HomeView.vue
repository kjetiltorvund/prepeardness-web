<template>
  <div class="home">
    <div class="account">
      <span v-if="user">{{ user.name ?? user.email }}</span>
      <Button label="Logg ut" icon="pi pi-sign-out" size="small" text @click="onSignOut" />
    </div>

    <InventoryList />

    <Button class="add-button" icon="pi pi-plus" rounded size="large" aria-label="Legg til vare"
      @click="scanVisible = true" />

    <ScanItem v-model:visible="scanVisible" @scanned="openEditor" @manual="openEditor(createDefault())" />

    <Drawer v-model:visible="drawerVisible" header="Legg til vare" position="right">
      <EditItem v-if="newItem" :item="newItem" :saving="updating" @save="onSave" />
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import InventoryList from '@/components/InventoryList.vue'
import EditItem from '@/components/EditItem.vue'
import ScanItem from '@/components/ScanItem.vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { type InventoryItem, createDefault } from '@/models/InventoryItem'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const inventoryStore = useInventoryStore()
const { updating } = storeToRefs(inventoryStore)
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const router = useRouter()
const toast = useToast()

async function onSignOut() {
  await authStore.signOut()
  inventoryStore.reset()
  router.push({ name: 'login' })
}

const scanVisible = ref(false)
const drawerVisible = ref(false)
const newItem = ref<InventoryItem | null>(null)

function openEditor(item: InventoryItem) {
  newItem.value = item
  scanVisible.value = false
  drawerVisible.value = true

  if (item.barcode && !item.name) {
    toast.add({
      severity: 'info',
      summary: 'Fant ikke produktinfo',
      detail: 'Fyll inn navnet selv.',
      life: 3000,
    })
  }
}

async function onSave(item: InventoryItem) {
  try {
    const { replacedIds } = await inventoryStore.createItem(item)
    drawerVisible.value = false
    toast.add({
      severity: 'success',
      summary: 'Varen ble lagt til',
      detail:
        replacedIds.length > 0
          ? `Erstattet ${replacedIds.length} utløpt${replacedIds.length === 1 ? '' : 'e'} vare${replacedIds.length === 1 ? '' : 'r'}.`
          : undefined,
      life: 4000,
    })
  } catch (cause) {
    toast.add({
      severity: 'error',
      summary: 'Kunne ikke legge til varen',
      detail: cause instanceof Error ? cause.message : 'En ukjent feil oppstod.',
      life: 3000,
    })
  }
}
</script>

<style scoped>
.account {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.add-button {
  position: fixed;
  right: 1.5rem;
  bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  width: 4rem;
  height: 4rem;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.add-button :deep(.pi) {
  font-size: 1.5rem;
}
</style>
