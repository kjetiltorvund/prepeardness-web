import { ref, type Ref } from 'vue'
import api from './api'
import { toInventoryItemPayload, type InventoryItem } from '../models/InventoryItem'

export function useInventoryService() {
  const items: Ref<InventoryItem[]> = ref([
    // Example data; replace with real data or fetch from API
    {
      id: 1,
      name: 'Milk',
      expiration_date: '2025-05-03T00:00:00.000+00:00',
      category: 'Dairy',
      quantity: 2,
      unit: 'L',
      expired: false,
      daysUntilExpiration: 2,
      placement: 'Fridge',
      active: true,
    },
    {
      id: 2,
      name: 'Bread',
      expiration_date: '2025-05-01T00:00:00.000+00:00',
      category: 'Bakery',
      quantity: 1,
      unit: 'Loaf',
      expired: true,
      daysUntilExpiration: 0,
      placement: 'Pantry',
      active: true,
    },
  ])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const fetchExpiringItems = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/items/expiring`)
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      items.value = await response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error occurred'
      console.error('Error fetching items:', e)
    } finally {
      loading.value = false
    }
  }


  return {
    items,
    loading,
    error,
    fetchExpiringItems
  }
}
