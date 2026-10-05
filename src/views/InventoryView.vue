<template>
  <div>
    <h1>Inventory</h1>
    <p v-if="loading">Loading items...</p>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>Expiration Date</th>
          <th>Status</th>
          <th>Placement</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.category }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.unit }}</td>
          <td>{{ formatLocalDate(item.expiration_date) }}</td>
          <td>{{ getExpirationStatus(item) }}</td>
          <td>{{ item.placement }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { getExpirationStatus } from '@/models/InventoryItem'
import { useInventoryStore } from '@/stores/inventory'
import { formatLocalDate } from '@/utils/dateTime'

const inventoryStore = useInventoryStore()
const { items, loading, error } = storeToRefs(inventoryStore)

onMounted(() => inventoryStore.fetchItems())
</script>
