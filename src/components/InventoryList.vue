<script setup lang="ts">
import { onMounted, ref } from 'vue'
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

const inventoryStore = useInventoryStore()
const { items, loading, error, updating } = storeToRefs(inventoryStore)

const toast = useToast();
const confirm = useConfirm()

onMounted(() => {
  inventoryStore.fetchItems()
})

const selectedItem = ref<InventoryItem | null>(null)
const sidebarVisible = ref(false)

const onRowSelect = (event: { data: InventoryItem }) => {
  selectedItem.value = event.data
  sidebarVisible.value = true
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
  console.log(status)
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

    <Drawer v-model:visible="sidebarVisible" header="Rediger vare" position="right">
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
</style>
