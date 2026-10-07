import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { disableGoogleAutoSelect, onGoogleCredential } from '@/services/googleAuth'

const STORAGE_KEY = 'auth_token'

export interface AuthUser {
  email: string
  name?: string
  picture?: string
  /** Expiry of the ID token, in seconds since epoch */
  exp: number
}

// Only reads the claims for display and expiry. The backend verifies the signature.
function decodeToken(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    const claims = JSON.parse(json)
    return { email: claims.email, name: claims.name, picture: claims.picture, exp: claims.exp }
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(STORAGE_KEY))
  const user = computed(() => (token.value ? decodeToken(token.value) : null))

  function hasValidToken() {
    return !!user.value && user.value.exp * 1000 > Date.now()
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(STORAGE_KEY, newToken)
  }

  function clearToken() {
    token.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  async function signOut() {
    clearToken()
    await disableGoogleAutoSelect()
  }

  onGoogleCredential(setToken)

  return { token, user, hasValidToken, setToken, clearToken, signOut }
})
