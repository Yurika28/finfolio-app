import axios from 'axios'

// Empty baseURL makes axios use a relative path (/api/stocks → same origin).
// next.config.ts rewrites /api/* → NEXT_PUBLIC_API_URL/api/* server-side,
// so the browser never makes a cross-origin request and CORS is never triggered.
const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('finfolio_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('finfolio_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
