// src/services/api.ts
import axios, { InternalAxiosRequestConfig } from "axios"

const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ1MDcxOTQ0LCJpYXQiOjE3NDUwNzEzNDQsImp0aSI6IjhlY2VlNzZkNDdjZTQ4ZTA4NzVhOThmNWY3Zjk1YTNiIiwidXNlcl9pZCI6MjE3MTk0fQ.gNdAVYVba0r3cYn6i__v0IjOimZQ8cUwPwrtsxxD2Pk"

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
