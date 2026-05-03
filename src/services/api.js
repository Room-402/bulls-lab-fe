import axios from "axios"
import { localStorageService } from "./localStorageService"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1" // change to your backend

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach token and user_id automatically via interceptor
api.interceptors.request.use((config) => {
  const token = localStorageService.getToken()
  if (token) {
    config.headers["Authorization"] = `${token}`
  }

  const user = localStorageService.getUser()
  if (user?.id) {
    if (config.method?.toUpperCase() === "GET") {
      config.params = { ...config.params, user_id: user.id }
    } else {
      if (config.data && typeof config.data === "object") {
        config.data = { ...config.data, user_id: user.id }
      } else if (!config.data) {
        config.data = { user_id: user.id }
      }
    }
  }

  return config
})

export async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, headers: customHeaders, ...rest } = options

  const response = await api.request({
    url: endpoint,
    method,
    data: body ? JSON.parse(body) : undefined,
    headers: customHeaders,
    ...rest,
  })

  return { data: response.data, headers: response.headers }
}

export default api
