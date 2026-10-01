<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'

import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'

import { type GroceryItem, createDefault } from '../models/GroceryItem'

const props = withDefaults(
  defineProps<{
    groceryItem?: GroceryItem
    saving?: boolean
  }>(),
  {
    groceryItem: createDefault,
    saving: false,
  },
)

const emit = defineEmits<{
  save: [item: GroceryItem]
}>()

const editableItem = ref<GroceryItem>(createDefault())

const expirationDate = computed<Date | null>({
  get: () => {
    const value = editableItem.value.expirationDate
    if (!value) return null

    const dateOnly = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(value)
    if (dateOnly) {
      return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    }

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  },
  set: (date) => {
    if (!date) {
      editableItem.value.expirationDate = ''
      return
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    editableItem.value.expirationDate = year + '-' + month + '-' + day
  },
})

watch(
  () => props.groceryItem,
  (item) => {
    editableItem.value = { ...item }
  },
  { immediate: true },
)

function submit() {
  emit('save', { ...editableItem.value })
}
</script>
<template>
  <form @submit.prevent="submit">
    <div class="flex flex-column gap-2">
      <label for="article_name">Navn</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <InputText id="article_name" type="text" v-model="editableItem.article_name" />
      </IconField>
      <small id="article_name-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="expirationDate">Utløpsdato</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <DatePicker id="expirationDate" v-model="expirationDate" />
      </IconField>
      <small id="expirationDate-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="category">Kategori</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <InputText id="category" type="text" v-model="editableItem.category" />
      </IconField>
      <small id="category-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="quantity">Antall</label>
      <InputNumber id="quantity" v-model="editableItem.quantity" :min="0" />
    </div>
    <div class="flex flex-column gap-2">
      <label for="unit">Enhet</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <InputText id="unit" type="text" v-model="editableItem.unit" />
      </IconField>
      <small id="unit-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="placement">Plassering</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <InputText id="placement" type="text" v-model="editableItem.placement" />
      </IconField>
      <small id="placement-help"></small>
    </div>

    <Button type="submit" label="Lagre" icon="pi pi-check" :loading="saving" />
  </form>
</template>
