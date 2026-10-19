import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import { toUserPayload, type User } from '@/models/User'

export const useUserStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const loading = ref(false)
  const updating = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function fetchUsers(force = false) {
    if (loaded.value && !force) return

    loading.value = true
    error.value = null

    try {
      const response = await api.get<User[]>('/users')
      users.value = response.data
      loaded.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not load users'
    } finally {
      loading.value = false
    }
  }

  async function createUser(newUser: User): Promise<User> {
    updating.value = true
    try {
      const response = await api.post<User>('/users', toUserPayload(newUser))
      users.value.push(response.data)
      return response.data
    } catch (cause) {
      throw cause instanceof Error ? cause : new Error('Could not create user')
    } finally {
      updating.value = false
    }
  }

  // Drops cached users, e.g. when another user signs in
  function reset() {
    users.value = []
    error.value = null
    loaded.value = false
  }

  return {
    users,
    loading,
    updating,
    error,
    fetchUsers,
    createUser,
    reset,
  }
})
