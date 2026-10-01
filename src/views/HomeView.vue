<template>
  <div class="home">
    <GroceryList />

    <Button class="add-button" icon="pi pi-plus" rounded size="large" aria-label="Legg til vare"
      @click="scanVisible = true" />

    <ScanGrocery v-model:visible="scanVisible" @scanned="openEditor" @manual="openEditor(createDefault())" />

    <Drawer v-model:visible="drawerVisible" header="Legg til vare" position="right">
      <EditGrocery v-if="newItem" :grocery-item="newItem" :saving="updating" @save="onSave" />
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import GroceryList from '@/components/GroceryList.vue'
import EditGrocery from '@/components/EditGrocery.vue'
import ScanGrocery from '@/components/ScanGrocery.vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { type GroceryItem, createDefault } from '@/models/GroceryItem'
import { useGroceryStore } from '@/stores/groceries'

const groceryStore = useGroceryStore()
const { updating } = storeToRefs(groceryStore)
const toast = useToast()

const scanVisible = ref(false)
const drawerVisible = ref(false)
const newItem = ref<GroceryItem | null>(null)

function openEditor(item: GroceryItem) {
  newItem.value = item
  scanVisible.value = false
  drawerVisible.value = true

  if (item.barcode && !item.article_name) {
    toast.add({
      severity: 'info',
      summary: 'Fant ikke produktinfo',
      detail: 'Fyll inn navnet selv.',
      life: 3000,
    })
  }
}

async function onSave(item: GroceryItem) {
  try {
    await groceryStore.createGrocery(item)
    drawerVisible.value = false
    toast.add({ severity: 'success', summary: 'Varen ble lagt til', life: 3000 })
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
