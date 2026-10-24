import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import api from '@/services/api'
import { toUserPayload, type User } from '@/models/User'

// Prefers the backend's error message over axios' generic "Request failed with status code ..."
function toError(cause: unknown, fallback: string): Error {
  if (isAxiosError(cause) && cause.response?.status !== 403) {
    const data = cause.response?.data
    const message = typeof data === 'string' ? data : (data?.message ?? data?.detail ?? data?.error)
    if (message) return new Error(message)
  }
  return cause instanceof Error ? cause : new Error(fallback)
}

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
      error.value = toError(cause, 'Could not load users').message
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
      throw toError(cause, 'Could not create user')
    } finally {
      updating.value = false
    }
  }

  async function updateUser(updatedUser: User): Promise<User> {
    if (updatedUser.id == null) {
      throw new Error('Cannot update a user without an id')
    }

    updating.value = true
    try {
      const response = await api.put<User>('/users', toUserPayload(updatedUser))
      const savedUser = { ...updatedUser, ...response.data }
      const index = users.value.findIndex((user) => user.id === updatedUser.id)

      if (index !== -1) {
        users.value[index] = savedUser
      }

      return savedUser
    } catch (cause) {
      throw toError(cause, 'Could not update user')
    } finally {
      updating.value = false
    }
  }

  async function deleteUser(id: number): Promise<void> {
    updating.value = true
    try {
      await api.delete(`/users/${id}`)
      users.value = users.value.filter((user) => user.id !== id)
    } catch (cause) {
      throw toError(cause, 'Could not delete user')
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
    deleteUser,
    reset,
  }
})
