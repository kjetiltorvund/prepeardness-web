<template>
  <div class="home">
    <Button icon="pi pi-plus-circle" @click="visibleRight = true" />
    <GroceryList />
    <Sidebar v-model:visible="visibleRight" header="Legg til vare" position="right">
      <EditGrocery />
    </Sidebar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GroceryList from '@/components/GroceryList.vue'
import EditGrocery from '@/components/EditGrocery.vue'
import Sidebar from 'primevue/sidebar'

import Button from 'primevue/button'

const visibleRight = ref(false)
</script>
