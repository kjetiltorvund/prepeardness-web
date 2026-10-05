import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import {
  toInventoryItemPayload,
  type CreateItemResponse,
  type InventoryItem,
} from '@/models/InventoryItem'
import { parseUtcDateTime } from '@/utils/dateTime'

function withExpiration(item: InventoryItem, now = new Date()): InventoryItem {
  const expirationDate = parseUtcDateTime(item.expiration_date)
  return {
    ...item,
    expired: expirationDate ? expirationDate < now : false,
    daysUntilExpiration: expirationDate
      ? Math.max(0, Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0,
  }
}

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([])
  const loading = ref(false)
  const updating = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function fetchItems(force = false) {
    if (loaded.value && !force) return

    loading.value = true
    error.value = null

    try {
      const response = await api.get<InventoryItem[]>('/items')
      items.value = response.data.map((item) => withExpiration(item))

      loaded.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not load items'
    } finally {
      loading.value = false
    }
  }

  async function updateItem(updatedItem: InventoryItem): Promise<InventoryItem> {
    if (updatedItem.id == null) {
      throw new Error('Cannot update an item without an id')
    }

    updating.value = true
    try {
      const response = await api.put<InventoryItem>('/items', toInventoryItemPayload(updatedItem))
      const savedItem = withExpiration({ ...updatedItem, ...response.data })
      const index = items.value.findIndex((item) => item.id === updatedItem.id)

      if (index !== -1) {
        items.value[index] = savedItem
      }

      return savedItem
    } catch (cause) {
      throw cause instanceof Error ? cause : new Error('Could not update item')
    } finally {
      updating.value = false
    }
  }

  async function createItem(
    newItem: InventoryItem,
  ): Promise<{ item: InventoryItem; replacedIds: number[] }> {
    updating.value = true
    try {
      const response = await api.post<CreateItemResponse>('/items', toInventoryItemPayload(newItem))
      const replacedIds = response.data.replaced_ids ?? []
      // Keep fields the API doesn't store (category, quantity, unit) from the form.
      const savedItem = withExpiration({ ...newItem, ...response.data.item })

      if (replacedIds.length > 0) {
        items.value = items.value.filter(
          (item) => item.id == null || !replacedIds.includes(item.id),
        )
      }
      items.value.push(savedItem)

      return { item: savedItem, replacedIds }
    } catch (cause) {
      throw cause instanceof Error ? cause : new Error('Could not create item')
    } finally {
      updating.value = false
    }
  }

  async function deleteItem(id: number): Promise<void> {
    updating.value = true
    try {
      await api.delete(`/items/${id}`)
      items.value = items.value.filter((item) => item.id !== id)
    } catch (cause) {
      throw cause instanceof Error ? cause : new Error('Could not delete item')
    } finally {
      updating.value = false
    }
  }

  return {
    items,
    loading,
    updating,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
})
