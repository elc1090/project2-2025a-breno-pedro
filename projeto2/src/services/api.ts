// src/services/api.ts
import axios, { InternalAxiosRequestConfig } from "axios"

const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ0ODk2ODkxLCJpYXQiOjE3NDQ4OTYyOTEsImp0aSI6IjIwYzdlNDQzMTE2ZTQxYmE4ZTE0MDJmZjUzN2RkYTE0IiwidXNlcl9pZCI6MjE3MTk0fQ.EE-r9-Ugp7585gEUkVkx5E4HljHoFyRZgY6xNFmE2J4"

const api = axios.create({
  baseURL: "https://wger.de/api/v2/",
  headers: { Accept: "application/json" },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers = config.headers ?? {}
  config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`
  return config
})

export default api
