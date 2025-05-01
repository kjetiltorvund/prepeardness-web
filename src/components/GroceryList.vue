<script setup lang="ts">
import { onMounted } from 'vue'
import { useGroceryService } from '../services/GroceryService'
import { getExpirationStatus, ExpirationStatus, type GroceryItem } from '../models/GroceryItem'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'

const { groceries, loading, error, fetchExpiringGroceries } = useGroceryService()

onMounted(() => {
  //fetchExpiringGroceries()
})

const getTagSeverity = (item: GroceryItem) => {
  const status = getExpirationStatus(item)
  switch (status) {
    case ExpirationStatus.EXPIRED:
      return 'danger'
    case ExpirationStatus.EXPIRING_SOON:
      return 'warning'
    default:
      return 'success'
  }
}

const getExpirationLabel = (item: GroceryItem) => {
  if (item.isExpired) {
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
        <DataTable
          :value="groceries"
          :paginator="true"
          :rows="50"
          :rowsPerPageOptions="[5, 10, 25, 50]"
          tableStyle="min-width: 50rem"
          stripedRows
          sortField="daysUntilExpiration"
          :sortOrder="1"
          filterDisplay="menu"
        >
          <Column field="name" header="Vare" sortable />
          <Column field="category" header="Kategori" sortable filter filterMatchMode="contains" />
          <Column field="placement" header="Plassering" sortable />
          <Column field="expirationDate" header="Utløpsdato" sortable>
            <template #body="{ data }">
              {{ new Date(data.expirationDate).toLocaleDateString() }}
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
