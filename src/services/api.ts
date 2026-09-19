import axios from 'axios'

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

    // Example: Add authentication token from localStorage
    const token = localStorage.getItem('auth_token')
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

    // Example: Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token
      console.log('Unauthorized access - redirecting to login')
      // router.push('/login');
    }

    // Example: Handle 403 Forbidden
    if (error.response && error.response.status === 403) {
      console.log('Forbidden resource')
    }

    return Promise.reject(error)
  },
)

export default api
export { BASE_URL }
