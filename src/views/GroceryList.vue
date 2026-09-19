<template>
  <div>
    <h1>Grocery List</h1>
    <p v-if="loading">Loading groceries...</p>
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
        <tr v-for="item in groceryItems" :key="item.id">
          <td>{{ item.article_name }}</td>
          <td>{{ item.category }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.unit }}</td>
          <td>{{ item.expirationDate }}</td>
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
import { getExpirationStatus } from '@/models/GroceryItem'
import { useGroceryStore } from '@/stores/groceries'

const groceryStore = useGroceryStore()
const { groceries: groceryItems, loading, error } = storeToRefs(groceryStore)

onMounted(() => groceryStore.fetchGroceries())
</script>
