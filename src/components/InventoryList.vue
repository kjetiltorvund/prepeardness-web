<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useInventoryStore } from '@/stores/inventory'
import { getExpirationStatus, ExpirationStatus, type InventoryItem } from '../models/InventoryItem'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'
import Drawer from 'primevue/drawer'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import EditItem from './EditItem.vue'
import { useToast } from 'primevue/usetoast';
import { formatLocalDate } from '@/utils/dateTime'
import { useMediaQuery } from '@/composables/useMediaQuery'

const inventoryStore = useInventoryStore()
const { items, loading, error, updating } = storeToRefs(inventoryStore)

const isMobile = useMediaQuery('(max-width: 768px)')

// Soonest expiring first; items without an expiration date last
const sortedItems = computed(() =>
  [...items.value].sort((a, b) => {
    if (!a.expiration_date !== !b.expiration_date) return a.expiration_date ? -1 : 1
    if (a.expired !== b.expired) return a.expired ? -1 : 1
    return a.daysUntilExpiration - b.daysUntilExpiration
  }),
)

const openItem = (item: InventoryItem) => {
  selectedItem.value = item
  sidebarVisible.value = true
}

const toast = useToast();
const confirm = useConfirm()

onMounted(() => {
  inventoryStore.fetchItems()
})

const selectedItem = ref<InventoryItem | null>(null)
const sidebarVisible = ref(false)

const onRowSelect = (event: { data: InventoryItem }) => {
  openItem(event.data)
}

const onSave = async (updatedItem: InventoryItem) => {
  try {
    await inventoryStore.updateItem(updatedItem)
    sidebarVisible.value = false
    toast.add({
      severity: 'success',
      summary: 'Varen ble oppdatert',
      life: 3000,
    })
  } catch (cause) {
    toast.add({
      severity: 'error',
      summary: 'Kunne ikke oppdatere varen',
      detail: cause instanceof Error ? cause.message : 'En ukjent feil oppstod.',
      life: 3000,
    })
  }
}

const onDelete = (item: InventoryItem) => {
  if (item.id == null) return
  const id = item.id

  confirm.require({
    header: 'Slett vare',
    message: `Vil du slette «${item.name}»?`,
    icon: 'pi pi-trash',
    acceptProps: { label: 'Slett', severity: 'danger' },
    rejectProps: { label: 'Avbryt', severity: 'secondary', outlined: true },
    accept: async () => {
      try {
        await inventoryStore.deleteItem(id)
        if (selectedItem.value?.id === id) {
          sidebarVisible.value = false
          selectedItem.value = null
        }
        toast.add({ severity: 'success', summary: 'Varen ble slettet', life: 3000 })
      } catch (cause) {
        toast.add({
          severity: 'error',
          summary: 'Kunne ikke slette varen',
          detail: cause instanceof Error ? cause.message : 'En ukjent feil oppstod.',
          life: 3000,
        })
      }
    },
  })
}

const getTagSeverity = (item: InventoryItem) => {
  const status = getExpirationStatus(item)
  switch (status) {
    case ExpirationStatus.EXPIRED:
      return 'danger'
    case ExpirationStatus.EXPIRING_SOON:
      return 'warning'
    case ExpirationStatus.UNKNOWN:
      return 'secondary'
    default:
      return 'success'
  }
}

const getExpirationLabel = (item: InventoryItem) => {
  if (!item.expiration_date) {
    return 'Ingen utløpsdato'
  } else if (item.expired) {
    return 'Utløpt'
  } else if (item.daysUntilExpiration === 0) {
    return 'Utløper i dag'
  } else if (item.daysUntilExpiration === 1) {
    return '1 dag igjen'
  } else {
    return `${item.daysUntilExpiration} dager igjen`
  }
}
</script>

<template>
  <div class="inventory-container">
    <Toast />
    <ConfirmDialog />
    <div class="card">
      <h1>Varebeholdning</h1>

      <div v-if="loading" class="loading-spinner">
        <ProgressSpinner />
      </div>

      <div v-else-if="error" class="error-message">
        <Message severity="error" :text="error" />
      </div>

      <ul v-else-if="isMobile" class="item-list">
        <li v-if="sortedItems.length === 0" class="empty">Ingen varer</li>
        <li v-for="item in sortedItems" :key="item.id" class="item-card" role="button" tabindex="0"
          @click="openItem(item)" @keydown.enter="openItem(item)">
          <div class="item-main">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-meta">
              <span>{{ item.quantity }} {{ item.unit }}</span>
              <span v-if="item.placement"><i class="pi pi-map-marker" /> {{ item.placement }}</span>
              <span v-if="item.category"><i class="pi pi-tag" /> {{ item.category }}</span>
            </div>
            <div class="item-expiration">
              <Tag :severity="getTagSeverity(item)" :value="getExpirationLabel(item)" />
              <span v-if="item.expiration_date" class="item-date">{{ formatLocalDate(item.expiration_date) }}</span>
            </div>
          </div>
          <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Slett vare" :disabled="updating"
            @click.stop="onDelete(item)" @keydown.enter.stop />
        </li>
      </ul>

      <div v-else>
        <DataTable :value="items" :paginator="true" :rows="50" :rowsPerPageOptions="[5, 10, 25, 50]"
          tableStyle="min-width: 50rem" stripedRows sortField="daysUntilExpiration" :sortOrder="1" filterDisplay="menu"
          selectionMode="single" v-model:selection="selectedItem" @rowSelect="onRowSelect">
          <Column field="id" header="ID" sortable />
          <Column field="name" header="Vare" sortable />
          <Column field="category" header="Kategori" sortable filter filterMatchMode="contains" />
          <Column field="placement" header="Plassering" sortable />
          <Column field="expiration_date" header="Utløpsdato" sortable>
            <template #body="{ data }">
              {{ formatLocalDate(data.expiration_date) }}
            </template>
          </Column>
          <Column field="daysUntilExpiration" header="Dager igjen" sortable>
            <template #body="{ data }">
              <Tag :severity="getTagSeverity(data)" :value="getExpirationLabel(data)" />
            </template>
          </Column>
          <Column field="quantity" header="Antall" sortable>
            <template #body="{ data }"> {{ data.quantity }} {{ data.unit }} </template>
          </Column>
          <Column header="Handling">
            <template #body="{ data }">
              <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Slett vare"
                :disabled="updating" @click.stop="onDelete(data)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Drawer v-model:visible="sidebarVisible" header="Rediger vare" position="right"
      :style="isMobile ? { width: '100%' } : undefined">
      <EditItem v-if="selectedItem" :item="selectedItem" :saving="updating" deletable @save="onSave"
        @delete="onDelete" />
    </Drawer>
  </div>


</template>

<style scoped>
.inventory-container {
  padding: 1rem;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.error-message {
  margin: 1rem 0;
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-content-border-radius);
  background: var(--p-content-background);
  cursor: pointer;
}

.item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.item-name {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.item-expiration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-date {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.empty {
  text-align: center;
  color: var(--p-text-muted-color);
  padding: 1rem;
}

@media (max-width: 768px) {
  .inventory-container {
    padding: 0.5rem;
  }
}
</style>
