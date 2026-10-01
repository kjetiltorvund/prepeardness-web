import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import type { GroceryItem } from '@/models/GroceryItem'

export const useGroceryStore = defineStore('groceries', () => {
  const groceries = ref<GroceryItem[]>([])
  const loading = ref(false)
  const updating = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function fetchGroceries(force = false) {
    if (loaded.value && !force) return

    loading.value = true
    error.value = null

    try {
      const response = await api.get<GroceryItem[]>('/articles')
      groceries.value = response.data
      loaded.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not load groceries'
    } finally {
      loading.value = false
    }
  }

  async function updateGrocery(updatedItem: GroceryItem): Promise<GroceryItem> {
    if (updatedItem.id == null) {
      throw new Error('Cannot update a grocery item without an id')
    }

    updating.value = true
    try {
      const response = await api.put<GroceryItem>('/articles', updatedItem)
      const savedItem = { ...updatedItem, ...response.data }
      const index = groceries.value.findIndex((item) => item.id === updatedItem.id)

      if (index !== -1) {
        groceries.value[index] = savedItem
      }

      return savedItem
    } catch (cause) {
      throw cause instanceof Error ? cause : new Error('Could not update grocery item')
    } finally {
      updating.value = false
    }
  }

  return {
    groceries,
    loading,
    updating,
    error,
    fetchGroceries,
    updateGrocery,
  }
})
