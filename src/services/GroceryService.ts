import { ref, type Ref } from 'vue'
import api from './api'
import type { GroceryItem } from '../models/GroceryItem'

const API_URL = 'http://your-backend-url/api'

export function useGroceryService() {
  const groceries: Ref<GroceryItem[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const fetchExpiringGroceries = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`${API_URL}/groceries/expiring`)
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

  const addGroceryItem = async (item) => {
    try {
      // Headers automatically added by interceptor
      const response = await api.post('/groceries', item)
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
  }
}
