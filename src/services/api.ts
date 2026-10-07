import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_BASE_URL as string

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: '*/*',
    'API-Version': 'v1',
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding headers
api.interceptors.request.use(
  (config) => {
    // Add common headers here

    // Google ID token, validated by the backend
    const { token } = useAuthStore()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Example: Add other common headers
    config.headers['X-App-Version'] = '1.0.0'

    // You can add conditional headers based on request type
    if (config.method === 'post' || config.method === 'put') {
      // Special headers for POST/PUT requests
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling common responses
api.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    return response
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger

    // Missing or expired token: sign in again and come back to the current page
    if (error.response && error.response.status === 401) {
      useAuthStore().clearToken()
      // Imported lazily, since the router indirectly imports this module
      import('@/router').then(({ default: router }) => {
        router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
      })
    }

    // Signed in, but the account is not on the backend's allowlist for this operation
    if (error.response && error.response.status === 403) {
      error.message = 'Kontoen din har ikke tilgang til dette.'
    }

    return Promise.reject(error)
  },
)

export default api
export { BASE_URL }
