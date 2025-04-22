// src/services/api.ts
import axios, { InternalAxiosRequestConfig } from "axios"

const ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ1MzMwNTkxLCJpYXQiOjE3NDUzMjk5OTEsImp0aSI6IjNmZGEyNjQyMWRkOTQzYTI5NDg4NTA5NjNlZDVkZTA1IiwidXNlcl9pZCI6MjE3MTk0fQ.VXBxd2yG_qUWWjgnu68g1sG9cSOXWh_w2iSdk3hma7U"

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
