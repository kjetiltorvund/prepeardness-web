<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'

import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'

import { type InventoryItem, createDefault } from '../models/InventoryItem'
import { parseUtcDateTime, toUtcDateTime } from '@/utils/dateTime'

const props = withDefaults(
  defineProps<{
    item?: InventoryItem
    saving?: boolean
    deletable?: boolean
  }>(),
  {
    item: createDefault,
    saving: false,
    deletable: false,
  },
)

const emit = defineEmits<{
  save: [item: InventoryItem]
  delete: [item: InventoryItem]
}>()

const editableItem = ref<InventoryItem>(createDefault())

const expirationDate = computed<Date | null>({
  get: () => parseUtcDateTime(editableItem.value.expiration_date),
  set: (date) => {
    editableItem.value.expiration_date = date ? toUtcDateTime(date) : null
  },
})

watch(
  () => props.item,
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
      <label for="name">Navn</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-user"></InputIcon>
        <InputText id="name" type="text" v-model="editableItem.name" />
      </IconField>
      <small id="name-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="expirationDate">Utløpsdato</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-calendar"></InputIcon>
        <DatePicker id="expirationDate" v-model="expirationDate" dateFormat="dd.mm.yy" />
      </IconField>
      <small id="expirationDate-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="category">Kategori</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-tag"></InputIcon>
        <InputText id="category" type="text" v-model="editableItem.category" />
      </IconField>
      <small id="category-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="quantity">Antall</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-shopping-cart"></InputIcon>
        <InputNumber id="quantity" v-model="editableItem.quantity" :min="0" />
      </IconField>
    </div>
    <div class="flex flex-column gap-2">
      <label for="unit">Enhet</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-gauge"></InputIcon>
        <InputText id="unit" type="text" v-model="editableItem.unit" />
      </IconField>
      <small id="unit-help"></small>
    </div>
    <div class="flex flex-column gap-2">
      <label for="placement">Plassering</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-map-marker"></InputIcon>
        <InputText id="placement" type="text" v-model="editableItem.placement" />
      </IconField>
      <small id="placement-help"></small>
    </div>

    <div class="flex flex-column gap-2">
      <label for="barcode">Strekkode</label>
      <IconField iconPosition="left">
        <InputIcon class="pi pi-barcode"></InputIcon>
        <InputText id="barcode" type="text" inputmode="numeric" v-model="editableItem.barcode" />
      </IconField>
      <small id="barcode-help"></small>
    </div>

    <div class="flex gap-2">
      <Button type="submit" label="Lagre" icon="pi pi-check" :loading="saving" />
      <Button v-if="deletable" type="button" label="Slett" icon="pi pi-trash" severity="danger" outlined
        :disabled="saving" @click="emit('delete', props.item)" />
    </div>
  </form>
</template>
