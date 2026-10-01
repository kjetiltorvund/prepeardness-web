import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import { toGroceryPayload, type GroceryItem } from '@/models/GroceryItem'
import { parseUtcDateTime } from '@/utils/dateTime'

function withExpiration(item: GroceryItem, now = new Date()): GroceryItem {
  const expirationDate = parseUtcDateTime(item.expiration_date)
  return {
    ...item,
    expired: expirationDate ? expirationDate < now : false,
    daysUntilExpiration: expirationDate
      ? Math.max(0, Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0,
  }
}

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
      groceries.value = response.data.map((item) => withExpiration(item))

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
      const response = await api.put<GroceryItem>('/articles', toGroceryPayload(updatedItem))
      const savedItem = withExpiration({ ...updatedItem, ...response.data })
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

  async function createGrocery(newItem: GroceryItem): Promise<GroceryItem> {
    updating.value = true
    try {
      const response = await api.post<GroceryItem>('/articles', toGroceryPayload(newItem))
      // Keep fields the API doesn't store (category, quantity, unit) from the form.
      const savedItem = withExpiration({ ...newItem, ...response.data })
      groceries.value.push(savedItem)
      return savedItem
    } catch (cause) {
      throw cause instanceof Error ? cause : new Error('Could not create grocery item')
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
    createGrocery,
    updateGrocery,
  }
})
