<script setup lang="ts">
import { ref, type Ref } from 'vue'
import InputText from 'primevue/inputtext'

import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

import Button from 'primevue/button'

import { type GroceryItem, createDefault } from '../models/GroceryItem'

const groceryItem: Ref<GroceryItem> = ref(createDefault())

function saveAndClose() {
  alert('Test')
}
</script>
<template>
  <div>
    <div class="flex flex-column gap-2">
      <label for="name">Navn</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <InputText id="name" type="text" v-model="groceryItem.name" />
      </IconField>
      <small id="name-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="expirationDate">Utløpsdato</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <InputText id="expirationDate" type="text" v-model="groceryItem.expirationDate" />
      </IconField>
      <small id="expirationDate-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="category">Kategori</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <InputText id="category" type="text" v-model="groceryItem.category" />
      </IconField>
      <small id="category-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="unit">Enhet</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <InputText id="unit" type="text" v-model="groceryItem.unit" />
      </IconField>
      <small id="unit-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="placement">Plassering</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <InputText id="placement" type="text" v-model="groceryItem.placement" />
      </IconField>
      <small id="placement-help"></small>
    </div>

    <Button label="Legg til" icon="pi pi-pluss" @click="saveAndClose"></Button>

    <pre>{{ JSON.stringify(groceryItem, null, 2) }}</pre>
  </div>
</template>
