const BASE_URL = import.meta.env.VITE_BASE_URL as string

export function api(path: string, options: RequestInit = {}) {
  const url = /^https?:\/\//.test(path) ? path : `${BASE_URL}${path}`
  return fetch(url, options)
}
