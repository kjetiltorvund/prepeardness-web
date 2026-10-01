<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGroceryStore } from '@/stores/groceries'
import { getExpirationStatus, ExpirationStatus, type GroceryItem } from '../models/GroceryItem'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'
import Drawer from 'primevue/drawer'
import EditGrocery from './EditGrocery.vue'
import { useToast } from 'primevue/usetoast';
import { formatLocalDate } from '@/utils/dateTime'

const groceryStore = useGroceryStore()
const { groceries, loading, error, updating } = storeToRefs(groceryStore)

const toast = useToast();

onMounted(() => {
  groceryStore.fetchGroceries()
})

const selectedArticle = ref<GroceryItem | null>(null)
const sidebarVisible = ref(false)

const onRowSelect = (event: { data: GroceryItem }) => {
  selectedArticle.value = event.data
  sidebarVisible.value = true
}

const onSave = async (updatedItem: GroceryItem) => {
  try {
    await groceryStore.updateGrocery(updatedItem)
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

const getTagSeverity = (item: GroceryItem) => {
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

const getExpirationLabel = (item: GroceryItem) => {
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
  <div class="grocery-container">
    <Toast />
    <div class="card">
      <h1>Varebeholdning</h1>

      <div v-if="loading" class="loading-spinner">
        <ProgressSpinner />
      </div>

      <div v-else-if="error" class="error-message">
        <Message severity="error" :text="error" />
      </div>

      <div v-else>
        <DataTable :value="groceries" :paginator="true" :rows="50" :rowsPerPageOptions="[5, 10, 25, 50]"
          tableStyle="min-width: 50rem" stripedRows sortField="daysUntilExpiration" :sortOrder="1" filterDisplay="menu"
          selectionMode="single" v-model:selection="selectedArticle" @rowSelect="onRowSelect">
          <Column field="id" header="ID" sortable />
          <Column field="article_name" header="Vare" sortable />
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
            <template #body>
              <Button icon="pi pi-check" rounded severity="success" aria-label="Mark as Used" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Drawer v-model:visible="sidebarVisible" header="Rediger vare" position="right">
      <EditGrocery v-if="selectedArticle" :grocery-item="selectedArticle" :saving="updating" @save="onSave" />
    </Drawer>
  </div>


</template>

<style scoped>
.grocery-container {
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
