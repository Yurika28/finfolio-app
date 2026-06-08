// Single source of truth — import from here everywhere, never define inline

// ── Auth ──────────────────────────────────────────────────
export interface IUser {
  id: number
  email: string
  name: string | null
  createdAt: string
}

export interface IAuthResponse {
  token: string
  user: IUser
}

export interface ILoginPayload {
  email: string
  password: string
}

export interface IRegisterPayload {
  name: string
  email: string
  password: string
}

// ── Stocks ────────────────────────────────────────────────
export interface IStockQuote {
  id: number
  symbol: string
  close: number
  high: number
  low: number
  open: number
  dp: number        // daily change percent
  d: number         // daily change absolute
  insertedAt: string
}

export interface ICompanyProfile {
  id: number
  ticker: string
  name: string | null
  exchange: string | null
  finnhubIndustry: string | null
  marketCapitalization: number | null
  logo: string | null
  weburl: string | null
  updatedAt: string
}

export interface IWeeklyChart {
  id: number
  symbol: string
  date: string
  open: number
  high: number
  low: number
  close: number
  adjustedClose: number | null
  volume: number | null
}

// ── Crypto ────────────────────────────────────────────────
export interface ICryptoRate {
  id: number
  fromSymbol: string
  toSymbol: string
  exchangeRate: number
  lastRefreshed: string
  insertedAt: string
}

// ── Forex ─────────────────────────────────────────────────
export interface IForexPrice {
  id: number
  fromSymbol: string
  toSymbol: string
  date: string
  open: number
  high: number
  low: number
  close: number
  insertedAt: string
}

// ── News ──────────────────────────────────────────────────
export interface IMarketNews {
  id: number
  newsId: number
  category: string | null
  datetime: number | null
  headline: string | null
  source: string | null
  url: string | null
  insertedAt: string
}

export interface ICompanyNews {
  id: number
  newsId: number
  symbol: string
  category: string | null
  datetime: number | null
  headline: string | null
  image: string | null
  source: string | null
  summary: string | null
  url: string | null
  insertedAt: string
}

// ── IPO ───────────────────────────────────────────────────
export interface IIpoCalendar {
  id: number
  symbol: string | null
  name: string | null
  date: string | null
  price: number | null
  shares: number | null
  status: string | null
  insertedAt: string
}

// ── AI Insights ───────────────────────────────────────────
export interface IInsight {
  content: string
  generatedAt: string
  stale?: boolean
}

export interface IStockInsight {
  symbol: string
  content: string
}

export interface IChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface IChatResponse {
  reply: string
}

// ── Portfolio ─────────────────────────────────────────────
export interface IWatchlistItem {
  id: number
  userId: number
  symbol: string
  addedAt: string
}

export interface IHolding {
  id: number
  userId: number
  symbol: string
  shares: number
  buyPrice: number
  buyDate: string
}

export interface IAddHoldingPayload {
  symbol: string
  shares: number
  buyPrice: number
  buyDate: string
}

// ── News Sentiment ────────────────────────────────────────
export interface INewsSentiment {
  id: number
  symbol: string
  title: string | null
  url: string
  bannerImage: string | null
  source: string | null
  sourceDomain: string | null
  summary: string | null
  overallSentimentLabel: string | null
  overallSentimentScore: number | null
  sentimentLabel: string | null
  sentimentScore: number | null
  relevanceScore: number | null
  publishedAt: string | null
  fetchedAt: string
}

// ── Generic hook state ────────────────────────────────────
export interface IHookState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

// ── API error ─────────────────────────────────────────────
export interface IApiError {
  error: string
  stack?: string
}
