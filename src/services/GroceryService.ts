import { ref, type Ref } from 'vue'
import api from './api'
import { toGroceryPayload, type GroceryItem } from '../models/GroceryItem'

export function useGroceryService() {
  const groceries: Ref<GroceryItem[]> = ref([
    // Example data; replace with real data or fetch from API
    {
      id: 1,
      article_name: 'Milk',
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
      article_name: 'Bread',
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

  const fetchExpiringGroceries = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/groceries/expiring`)
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      groceries.value = await response.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error occurred'
      console.error('Error fetching groceries:', e)
    } finally {
      loading.value = false
    }
  }

  const addGroceryItem = async (item: GroceryItem) => {
    try {
      // Headers automatically added by interceptor
      const response = await api.post('/groceries', toGroceryPayload(item))
      return response.data
    } catch (error) {
      // Handle error
      console.error('Error adding a grocery item', error)
    }
  }

  return {
    groceries,
    loading,
    error,
    fetchExpiringGroceries,
    addGroceryItem,
  }
}
