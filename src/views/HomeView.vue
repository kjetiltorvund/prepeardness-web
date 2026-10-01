<template>
  <div class="home">
    <Button icon="pi pi-plus-circle" @click="visibleRight = true" />
    <GroceryList />
    <Drawer v-model:visible="visibleRight" header="Legg til vare" position="right">
      <EditGrocery />
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GroceryList from '@/components/GroceryList.vue'
import EditGrocery from '@/components/EditGrocery.vue'
import Drawer from 'primevue/drawer'

import Button from 'primevue/button'

const visibleRight = ref(false)
</script>
