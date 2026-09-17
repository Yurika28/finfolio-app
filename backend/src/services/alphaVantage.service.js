const prisma = require('../config/prisma')
const { delay } = require('../utils/delay')
const { STOCK_SYMBOLS, CRYPTO_SYMBOLS, NEWS_SENTIMENT_SYMBOLS } = require('../config/symbols')

const AV_BASE = 'https://www.alphavantage.co/query'
const AV_KEY = () => process.env.ALPHA_VANTAGE_KEY
const FETCH_TIMEOUT_MS = 10_000

// Rate limit guard — call this before touching any response data
// Emergency rule: if hit, return without writing — stale cache is better than a crash
const checkRateLimit = (json) => {
  if (json.Information?.includes('rate limit')) {
    console.error('[AlphaVantage] DAILY LIMIT REACHED — aborting sync, stale cache will be served')
    return true
  }
  if (json.Note?.includes('rate limit')) {
    console.warn('[AlphaVantage] Per-minute limit hit — slowing down')
    return true
  }
  return false
}

// Weekly chart — 24hr cache via cron schedule, only called by chartSync.job.js
// Rotates 4 symbols/day to stay within 4 calls/day budget
const syncWeeklyChart = async (symbols) => {
  for (const symbol of symbols) {
    const res = await fetch(
      `${AV_BASE}?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${symbol}&apikey=${AV_KEY()}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    )
    const json = await res.json()
    if (checkRateLimit(json)) return

    const series = json['Weekly Adjusted Time Series'] || {}
    if (!Object.keys(series).length) {
      console.warn(`[AlphaVantage] No weekly chart data for ${symbol}`)
      continue
    }

    const rows = Object.entries(series).map(([date, v]) => ({
      symbol,
      date,
      open:         parseFloat(v['1. open']),
      high:         parseFloat(v['2. high']),
      low:          parseFloat(v['3. low']),
      close:        parseFloat(v['4. close']),
      adjustedClose: parseFloat(v['5. adjusted close']),
      volume:       BigInt(v['6. volume'])
    }))

    for (const row of rows) {
      await prisma.weeklyChart.upsert({
        where: { symbol_date: { symbol: row.symbol, date: row.date } },
        update: {
          open: row.open, high: row.high, low: row.low,
          close: row.close, adjustedClose: row.adjustedClose, volume: row.volume
        },
        create: row
      })
    }

    console.log(`[AlphaVantage] Weekly chart synced: ${symbol} (${rows.length} rows)`)
    await delay(1000) // avoid per-minute burst limit between symbols
  }
}

// Crypto prices — 12hr cache via cron schedule, only called by cryptoSync.job.js
// 6 symbols × 2 runs/day = 12 calls/day
// Also backfills crypto_chart from the same response (no extra AV calls) so the
// crypto pair page can render a history chart, mirroring weekly_chart for stocks.
const syncCryptoPrices = async (symbols) => {
  for (const symbol of symbols) {
    const res = await fetch(
      `${AV_BASE}?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=USD&apikey=${AV_KEY()}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    )
    const json = await res.json()
    if (checkRateLimit(json)) return

    const series = json['Time Series (Digital Currency Daily)'] || {}
    const entries = Object.entries(series)
    if (!entries.length) {
      console.warn(`[AlphaVantage] No crypto data for ${symbol}`)
      continue
    }

    // AV changed their field names over time — fall back to the newer key if the old one is absent
    const rows = entries.map(([date, v]) => ({
      symbol,
      date,
      open:   parseFloat(v['1b. open (USD)']  ?? v['1. open']  ?? 0),
      high:   parseFloat(v['2b. high (USD)']  ?? v['2. high']  ?? 0),
      low:    parseFloat(v['3b. low (USD)']   ?? v['3. low']   ?? 0),
      close:  parseFloat(v['4b. close (USD)'] ?? v['4. close'] ?? 0),
      volume: v['5. volume'] !== undefined ? parseFloat(v['5. volume']) : null,
    }))

    const [latest] = rows

    await prisma.cryptoCurrencyRate.upsert({
      where: { fromSymbol_toSymbol: { fromSymbol: symbol, toSymbol: 'USD' } },
      update: { exchangeRate: latest.close, lastRefreshed: latest.date, insertedAt: new Date() },
      create: { fromSymbol: symbol, toSymbol: 'USD', exchangeRate: latest.close, lastRefreshed: latest.date }
    })

    for (const row of rows) {
      await prisma.cryptoChart.upsert({
        where: { symbol_date: { symbol: row.symbol, date: row.date } },
        update: { open: row.open, high: row.high, low: row.low, close: row.close, volume: row.volume },
        create: row
      })
    }

    console.log(`[AlphaVantage] Crypto synced: ${symbol}/USD @ ${latest.close} (${rows.length} chart rows)`)
    await delay(1200)
  }
}

// Forex rates — 12hr cache via cron schedule, only called by forexSync.job.js
// 2 pairs × 2 runs/day = 4 calls/day — stores last 30 days of daily OHLC
const syncForexRates = async (pairs) => {
  for (const { from, to } of pairs) {
    const res = await fetch(
      `${AV_BASE}?function=FX_DAILY&from_symbol=${from}&to_symbol=${to}&apikey=${AV_KEY()}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
    )
    const json = await res.json()
    if (checkRateLimit(json)) return

    const series = json['Time Series FX (Daily)'] || {}
    if (!Object.keys(series).length) {
      console.warn(`[AlphaVantage] No forex data for ${from}/${to}`)
      continue
    }

    // Take only the 30 most recent trading days — no point storing years of data
    const rows = Object.entries(series).slice(0, 30).map(([date, v]) => ({
      fromSymbol: from,
      toSymbol:   to,
      date,
      open:  parseFloat(v['1. open']),
      high:  parseFloat(v['2. high']),
      low:   parseFloat(v['3. low']),
      close: parseFloat(v['4. close'])
    }))

    for (const row of rows) {
      await prisma.forexPrice.upsert({
        where: { fromSymbol_toSymbol_date: { fromSymbol: row.fromSymbol, toSymbol: row.toSymbol, date: row.date } },
        update: { open: row.open, high: row.high, low: row.low, close: row.close },
        create: row
      })
    }

    console.log(`[AlphaVantage] Forex synced: ${from}/${to} (${rows.length} rows)`)
    await delay(1200)
  }
}

// News sentiment — called once/day at 6am by newsSync.job.js — 2 calls/day budget
// Upserts one news_sentiment row per (article, ticker) pair, keyed on [url, symbol]
// (MarketNews itself is owned by Finnhub — this is AV's separate sentiment feed)

const getNewsSentiment = async () => {
  const dayIndex = Math.floor(Date.now() / 86400000) % NEWS_SENTIMENT_SYMBOLS.length
  const tickers = NEWS_SENTIMENT_SYMBOLS[dayIndex]

  const res = await fetch(
    `${AV_BASE}?function=NEWS_SENTIMENT&tickers=${tickers}&sort=LATEST&apikey=${AV_KEY()}`,
    { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
  )
  const json = await res.json()
  if (checkRateLimit(json)) return []

  const articles = json.feed || []
  if (!articles.length) {
    console.warn(`[AlphaVantage] No news articles for ${tickers}`)
    return []
  }

  let rowCount = 0
  for (const article of articles) {
    // One row per ticker the article mentions (ticker_sentiment array)
    const tickerEntries = article.ticker_sentiment || []

    for (const ts of tickerEntries) {
      await prisma.newsSentiment.upsert({
        where: { url_symbol: { url: article.url, symbol: ts.ticker } },
        update: {
          title:                 article.title,
          bannerImage:           article.banner_image,
          source:                article.source,
          sourceDomain:          article.source_domain,
          summary:               article.summary,
          overallSentimentLabel: article.overall_sentiment_label,
          overallSentimentScore: parseFloat(article.overall_sentiment_score ?? 0),
          sentimentLabel:        ts.ticker_sentiment_label,
          sentimentScore:        parseFloat(ts.ticker_sentiment_score ?? 0),
          relevanceScore:        parseFloat(ts.relevance_score ?? 0),
          publishedAt:           article.time_published
        },
        create: {
          symbol:                ts.ticker,
          url:                   article.url,
          title:                 article.title,
          bannerImage:           article.banner_image,
          source:                article.source,
          sourceDomain:          article.source_domain,
          summary:               article.summary,
          overallSentimentLabel: article.overall_sentiment_label,
          overallSentimentScore: parseFloat(article.overall_sentiment_score ?? 0),
          sentimentLabel:        ts.ticker_sentiment_label,
          sentimentScore:        parseFloat(ts.ticker_sentiment_score ?? 0),
          relevanceScore:        parseFloat(ts.relevance_score ?? 0),
          publishedAt:           article.time_published
        }
      })
      rowCount++
    }
  }

  console.log(`[AlphaVantage] News sentiment stored for ${tickers}: ${articles.length} articles, ${rowCount} rows`)
  return articles
}

module.exports = { syncWeeklyChart, syncCryptoPrices, syncForexRates, getNewsSentiment }
