import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import type { GroceryItem } from '@/models/GroceryItem'

export const useGroceryStore = defineStore('groceries', () => {
  const groceries = ref<GroceryItem[]>([])
  const loading = ref(false)
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
      error.value =
        cause instanceof Error ? cause.message : 'Could not load groceries'
    } finally {
      loading.value = false
    }
  }

  return {
    groceries,
    loading,
    error,
    fetchGroceries,
  }
})