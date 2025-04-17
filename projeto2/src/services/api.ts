import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"

/** Carrega os tokens de onde você preferir */
let accessToken  = localStorage.getItem("wgerAccessToken") ?? ""
let refreshToken = localStorage.getItem("wgerRefreshToken") 
  ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ0ODUwMDQ4LCJpYXQiOjE3NDQ4NDk0NDgsImp0aSI6ImZhOTUyZDdiNDM4NzRkNTNiYjJkOTdkNDJhMWRmYjQ3IiwidXNlcl9pZCI6MjE3MTk0fQ.krh6PBLXieWV1i9sFCzuMenOo1ddl0f-Vc3qypIk60Q"

export const setTokens = (access: string, refresh?: string) => {
  accessToken = access
  localStorage.setItem("wgerAccessToken", access)
  if (refresh) {
    refreshToken = refresh
    localStorage.setItem("wgerRefreshToken", refresh)
  }
}

const api = axios.create({
  baseURL: "https://wger.de/api/v2/",
  headers: { Accept: "application/json" },
})

/* ---------- Request interceptor: coloca o access token --------- */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config
})

/* ---------- Response interceptor: renova token se 401 ---------- */
let isRefreshing = false
let queue: {
  resolve: (value: unknown) => void
  reject: (reason?: any) => void
}[] = []

const processQueue = (error: AxiosError | null, token?: string) => {
  queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  queue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config!
    const status = error.response?.status

    if (status === 401 && !(originalRequest as any)._retry) {
      // evita loop infinito
      (originalRequest as any)._retry = true

      if (isRefreshing) {
        // se já há refresh em andamento, coloca na fila
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers!.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(Promise.reject)
      }

      isRefreshing = true
      try {
        const { data } = await axios.post<{
          access: string
        }>("https://wger.de/api/v2/token/refresh/", {
          refresh: refreshToken,
        })

        setTokens(data.access) // salva o novo access
        processQueue(null, data.access)

        // ajusta header e repete a requisição original
        originalRequest.headers!.Authorization = `Bearer ${data.access}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, undefined)
        // opcional: deslogar o usuário ou mandar para tela de login
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
