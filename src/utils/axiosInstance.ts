// src/utils/axiosInstance.ts

import axios, { type InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL as string

const instance = axios.create()

// Request interceptor to prepend BASE_URL to relative paths
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.url && !/^https?:\/\//.test(config.url)) {
    config.url = `${BASE_URL}${config.url}`
  }
  return config
})

export default instance
