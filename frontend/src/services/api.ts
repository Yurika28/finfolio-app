import axios, { AxiosRequestConfig } from 'axios'

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

// Retry once on a transient failure (network drop, or the backend/DB briefly
// unavailable e.g. Railway cold start) — but only for GET requests, since
// retrying a POST like /buy or /sell risks executing the trade twice.
const RETRY_DELAY_MS = 600

const isRetriableError = (error: { code?: string; response?: { status: number } }) =>
  !error.response || error.response.status >= 500

// Endpoints where a 401 must NOT force-navigate the whole app to /login:
// - /api/auth/me is a silent background check AuthContext runs on every page
//   mount whenever a stale token exists — it already clears the token and
//   falls back to logged-out state gracefully on failure, so redirecting
//   here would yank users off public pages for a check they never asked for.
// - /api/chat is optional-auth (anonymous users are allowed) and never
//   actually returns 401 itself, but excluding it defensively costs nothing.
const NO_REDIRECT_ON_401 = ['/api/auth/me', '/api/chat']

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url as string | undefined
    const skipRedirect = url && NO_REDIRECT_ON_401.some((p) => url.startsWith(p))

    if (error.response?.status === 401 && typeof window !== 'undefined' && !skipRedirect) {
      localStorage.removeItem('finfolio_token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && skipRedirect && typeof window !== 'undefined') {
      localStorage.removeItem('finfolio_token')
    }

    const config = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined
    if (config && config.method === 'get' && !config._retried && isRetriableError(error)) {
      config._retried = true
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
      return api(config)
    }

    return Promise.reject(error)
  }
)

// Lightweight in-memory GET cache with in-flight de-dup — no external
// dependency needed for a project this size. Avoids re-hitting the backend's
// shared rate limiter every time a user re-visits or re-mounts the same view.
interface CacheEntry {
  data: unknown
  expiry: number
}

const cache: Map<string, CacheEntry> = new Map()
const inFlight: Map<string, Promise<unknown>> = new Map()

const buildCacheKey = (url: string, config?: AxiosRequestConfig) =>
  `${url}?${JSON.stringify(config?.params ?? {})}`

export function cachedGet<T>(url: string, config?: AxiosRequestConfig, ttlMs = 30_000): Promise<T> {
  const key = buildCacheKey(url, config)

  const cached = cache.get(key)
  if (cached && cached.expiry > Date.now()) {
    return Promise.resolve(cached.data as T)
  }

  const pending = inFlight.get(key)
  if (pending) return pending as Promise<T>

  const promise = api.get<T>(url, config)
    .then((res) => {
      cache.set(key, { data: res.data, expiry: Date.now() + ttlMs })
      return res.data
    })
    .finally(() => inFlight.delete(key))

  inFlight.set(key, promise)
  return promise
}

// Call after a mutation (buy/sell/watchlist change) so the next read doesn't
// serve stale cached data — e.g. invalidateCache('/api/portfolio/').
export function invalidateCache(urlPrefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(urlPrefix)) cache.delete(key)
  }
}

export default api
