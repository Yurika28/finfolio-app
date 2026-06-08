# FinFolio — AI Finance Tracker

A full-stack finance dashboard for tracking stocks, crypto, and forex with AI-powered insights and chat. The backend acts as a data broker — all external API calls happen through scheduled cron jobs, so the database serves as a persistent cache and users never hit a rate limit.

---

## Tech Stack

### Frontend

| Package | Purpose |
|---|---|
| Next.js 15 (App Router, Turbopack) | Framework, routing, SSR/CSR |
| React 19 | UI runtime |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| shadcn/ui (Radix UI) | Accessible component primitives |
| Recharts | Chart library (weekly price charts) |
| Axios | HTTP client for REST API calls |
| Socket.io-client | Real-time price updates over WebSocket |
| Sonner | Toast notification library |
| Lucide React | Icon set |
| next-themes | Dark/light theme toggle |

**Language:** TypeScript

### Backend

| Package | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server and REST API |
| Prisma 6 + `@prisma/client` | ORM and database schema management |
| PostgreSQL (Railway) | Primary database |
| `jsonwebtoken` | JWT-based authentication (7-day tokens) |
| `bcryptjs` | Password hashing |
| `node-cron` | Scheduled background sync jobs |
| `socket.io` | WebSocket server for real-time price broadcasts |
| `@google/genai` | Google Gemini AI SDK |
| `express-rate-limit` | Per-IP rate limiting on the API |
| `helmet` | HTTP security headers |
| `cors` | Cross-origin request policy |

**Language:** JavaScript (CommonJS)

---

## External APIs

### Finnhub — Unlimited Free Tier

Used for real-time stock data. No daily call budget.

| Data | Endpoint used |
|---|---|
| Live stock prices | `GET /quote` |
| Market news | `GET /news?category=general` |
| Company news | `GET /company-news` |
| Company profiles | `GET /stock/profile2` |
| IPO calendar | `GET /calendar/ipo` |

### Alpha Vantage — 25 Calls/Day Free Tier

Used for historical and alternative data. **Every call is made by a cron job, never by a live user request.** The database acts as the cache.

| Data | AV Function | Schedule | Calls/Day |
|---|---|---|---|
| Weekly stock charts | `TIME_SERIES_WEEKLY_ADJUSTED` | 2am, 4 symbols/batch | 4 |
| Crypto prices | `DIGITAL_CURRENCY_DAILY` | 8am + 8pm, 6 symbols | 12 |
| Forex rates (GBP/USD, EUR/USD) | `FX_DAILY` | 9am + 9pm, 2 pairs | 4 |
| News sentiment | `NEWS_SENTIMENT` | 6am, 1 ticker rotation | 1 |
| **Total** | | | **21 / 25** |

4 calls are held in reserve as a safety buffer.

### Google Gemini — `gemini-2.5-flash`

Used for all AI features. Configured with `thinkingBudget: 0` to use standard output mode (required for this model to return plain text).

| Feature | When |
|---|---|
| Daily market summary | Cron job at 7am, result cached in `insights` table |
| Stock/crypto insight | On demand, result cached per symbol in `insights` table |
| AI market chat | On demand, streamed per session |

---

## REST API

All routes are prefixed with `/api`.

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account, returns JWT |
| `POST` | `/api/auth/login` | — | Sign in, returns JWT |
| `GET` | `/api/stocks` | — | All tracked stock prices |
| `GET` | `/api/stocks/:symbol` | — | Single stock price + weekly chart |
| `GET` | `/api/crypto` | — | All crypto rates |
| `GET` | `/api/crypto/:symbol` | — | Single crypto rate |
| `GET` | `/api/forex` | — | All forex pairs |
| `GET` | `/api/news` | — | Market news (latest 50) |
| `GET` | `/api/news/:symbol` | — | Company news for a ticker |
| `GET` | `/api/news/sentiment` | — | Ticker sentiment rows (latest 50) |
| `GET` | `/api/ipo` | — | IPO calendar |
| `GET` | `/api/insights/:type` | — | Cached AI insight for a type/symbol |
| `POST` | `/api/insights/:type` | — | Generate + cache AI insight |
| `POST` | `/api/chat` | JWT | Send chat message (persisted per user) |
| `GET` | `/api/chat/history` | JWT | Retrieve chat history |
| `GET` | `/api/portfolio` | JWT | User's holdings and watchlist |
| `POST` | `/api/portfolio/holdings` | JWT | Add a holding |
| `DELETE` | `/api/portfolio/holdings/:id` | JWT | Remove a holding |
| `POST` | `/api/portfolio/watchlist` | JWT | Add to watchlist |
| `DELETE` | `/api/portfolio/watchlist/:symbol` | JWT | Remove from watchlist |
| `GET` | `/health` | — | Railway health check |

---

## Database

PostgreSQL hosted on Railway, managed with Prisma. The schema has 13 models:

| Model | Table | Purpose |
|---|---|---|
| `User` | `users` | Account credentials and profile |
| `StockPrice` | `stocks_price` | Latest OHLC + change for each stock symbol |
| `WeeklyChart` | `weekly_chart` | Weekly OHLC history per symbol |
| `CryptoCurrencyRate` | `crypto_currency_rate` | Latest crypto exchange rate |
| `ForexPrice` | `forex_price` | Last 30 days of daily OHLC per pair |
| `CompanyProfile` | `company_profile` | Name, industry, market cap, logo |
| `MarketNews` | `market_news` | General finance headlines |
| `CompanyNews` | `company_news` | News articles tagged to a ticker |
| `IpoCalendar` | `ipo_calendar` | Upcoming IPO listings |
| `Insight` | `insights` | Cached Gemini AI summaries |
| `Watchlist` | `watchlist` | Per-user watchlisted symbols |
| `Holding` | `holdings` | Per-user stock/crypto positions |
| `ChatMessage` | `chat_messages` | Per-user AI chat history |
| `NewsSentiment` | `news_sentiment` | Alpha Vantage ticker-level sentiment |

All upserts use composite unique keys (`symbol + date`, `url + symbol`, etc.) so re-running a sync job is always idempotent.

---

## Cache Strategy and Cron Jobs

The core design rule: **the frontend never calls Finnhub or Alpha Vantage directly.** Every external API call happens inside a scheduled cron job on the backend. Express routes only read from the database.

```
External API
     │
     ▼ (cron job — scheduled, budget-aware)
PostgreSQL  ◄── Prisma upsert (idempotent)
     │
     ▼ (Express GET route — instant DB read)
Frontend
```

### Job Schedule

| Job | Schedule | Source API | What it does |
|---|---|---|---|
| `priceSync` | Every hour | Finnhub | Upserts all stock prices, emits Socket.io `price:update` event |
| `newsSync` | Every 4 hours (Finnhub) + 6am daily (AV) | Finnhub / AV | Refreshes market news headlines and AV sentiment |
| `cryptoSync` | 8am + 8pm | Alpha Vantage | Upserts latest crypto price for all 6 symbols |
| `forexSync` | 9am + 9pm | Alpha Vantage | Upserts last 30 days of daily OHLC for GBP/USD and EUR/USD |
| `chartSync` | 2am | Alpha Vantage | Upserts weekly chart for a rotating batch of 4 stocks |
| `marketSummary` | 7am | Gemini AI | Generates and caches today's AI market summary |

### Alpha Vantage Rate Limit Handling

The free tier allows **25 calls/day** and **5 calls/minute**. The service layer enforces two safeguards:

1. **`checkRateLimit(json)`** — inspects every API response before writing to the database. If the response contains a rate-limit message in `json.Information` (daily cap) or `json.Note` (per-minute burst), the sync function returns immediately without writing. Stale data is left in the database unchanged rather than crashing.

2. **`delay(1200ms)`** between symbols within each job — prevents triggering the per-minute burst limit when syncing multiple symbols in sequence.

The news sentiment job rotates through `NEWS_SENTIMENT_SYMBOLS` day-by-day (10 stocks + 6 crypto entries), so each ticker's sentiment is refreshed roughly once every 16 days using only 1 call/day.

---

## Real-Time Updates

Stock prices pushed over WebSocket using Socket.io. After each hourly `priceSync` cron run, the server emits a `price:update` event containing the updated price objects. The frontend `SocketContext` listens for this event and updates the in-memory store so cards reflect the latest price without a page refresh.

---

## Environment Variables

### Backend (`.env`)

```
DATABASE_URL=
JWT_SECRET=
ALPHA_VANTAGE_KEY=
FINNHUB_KEY=
GEMINI_API_KEY=
FRONTEND_URL=
PORT=
NODE_ENV=
```

### Frontend (`.env.local`)

```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
```

---

## Running Locally

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed   # creates test@finfolio.com / Test1234!
npm run dev          # starts on :4000

# Frontend
cd frontend
npm install
npm run dev          # starts on :3000
```