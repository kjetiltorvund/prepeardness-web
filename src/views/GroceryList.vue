<template>
  <div>
    <h1>Grocery List</h1>
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
          <td>{{ item.name }}</td>
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
import { ref } from 'vue'
import { type GroceryItem, getExpirationStatus } from '@/models/GroceryItem'

const groceryItems = ref<GroceryItem[]>([
  // Example data; replace with real data or fetch from API
  {
    id: 1,
    name: 'Milk',
    expirationDate: '2025-05-03',
    category: 'Dairy',
    quantity: 2,
    unit: 'L',
    isExpired: false,
    daysUntilExpiration: 2,
    placement: 'Fridge',
    active: true,
  },
  {
    id: 2,
    name: 'Bread',
    expirationDate: '2025-05-01',
    category: 'Bakery',
    quantity: 1,
    unit: 'Loaf',
    isExpired: true,
    daysUntilExpiration: 0,
    placement: 'Pantry',
    active: true,
  },
])
</script>
