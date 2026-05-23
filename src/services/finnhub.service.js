const prisma = require('../config/prisma')
const { oneHourAgo, sixHoursAgo, twentyFourHrsAgo } = require('../utils/dateHelpers')
const { delay } = require('../utils/delay')

const FINNHUB_BASE = 'https://finnhub.io/api/v1'
const headers = { 'X-Finnhub-Token': process.env.FINNHUB_KEY }

// Single quote — cache-first, 1hr TTL
const getStockQuote = async (symbol) => {
  const cached = await prisma.stockPrice.findFirst({
    where: { symbol, insertedAt: { gte: oneHourAgo() } }
  })
  if (cached) return cached

  const res = await fetch(`${FINNHUB_BASE}/quote?symbol=${symbol}`, { headers })
  if (!res.ok) throw new Error(`Finnhub quote ${symbol}: ${res.status}`)
  const d = await res.json()

  return prisma.stockPrice.upsert({
    where: { symbol },
    update: { close: d.c, high: d.h, low: d.l, open: d.o, dp: d.dp, d: d.d, insertedAt: new Date() },
    create: { symbol, close: d.c, high: d.h, low: d.l, open: d.o, dp: d.dp, d: d.d }
  })
}

// Batch sync — called by priceSync.job.js every hour
const syncAllPrices = async (symbols) => {
  const results = []
  for (const symbol of symbols) {
    try {
      const data = await getStockQuote(symbol)
      results.push({ symbol, status: 'ok', data })
    } catch (err) {
      results.push({ symbol, status: 'error', error: err.message })
    }
    await delay(300) // polite — Finnhub free tier allows ~30 req/s
  }
  return results
}

// Company profile — cache-first, 24hr TTL
const getCompanyProfile = async (symbol) => {
  const cached = await prisma.companyProfile.findFirst({
    where: { ticker: symbol, updatedAt: { gte: twentyFourHrsAgo() } }
  })
  if (cached) return cached

  const res = await fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${symbol}`, { headers })
  if (!res.ok) throw new Error(`Finnhub profile ${symbol}: ${res.status}`)
  const d = await res.json()

  return prisma.companyProfile.upsert({
    where: { ticker: symbol },
    update: {
      name: d.name, exchange: d.exchange, finnhubIndustry: d.finnhubIndustry,
      marketCapitalization: d.marketCapitalization, logo: d.logo, weburl: d.weburl,
      updatedAt: new Date()
    },
    create: {
      ticker: symbol, name: d.name, exchange: d.exchange, finnhubIndustry: d.finnhubIndustry,
      marketCapitalization: d.marketCapitalization, logo: d.logo, weburl: d.weburl
    }
  })
}

// Symbol-specific news — cache-first, 6hr TTL — fetches last 7 days
const getCompanyNews = async (symbol) => {
  const cached = await prisma.companyNews.findMany({
    where: { symbol, insertedAt: { gte: sixHoursAgo() } },
    orderBy: { datetime: 'desc' },
    take: 10
  })
  if (cached.length > 0) return cached

  const to = new Date().toISOString().split('T')[0]
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const res = await fetch(`${FINNHUB_BASE}/company-news?symbol=${symbol}&from=${from}&to=${to}`, { headers })
  if (!res.ok) throw new Error(`Finnhub company-news ${symbol}: ${res.status}`)
  const news = await res.json()

  for (const n of news.slice(0, 10)) {
    await prisma.companyNews.upsert({
      where: { newsId_symbol: { newsId: n.id, symbol } },
      update: {
        headline: n.headline, source: n.source, url: n.url, image: n.image,
        summary: n.summary, category: n.category, datetime: n.datetime, insertedAt: new Date()
      },
      create: {
        newsId: n.id, symbol, headline: n.headline, source: n.source, url: n.url,
        image: n.image, summary: n.summary, category: n.category, datetime: n.datetime
      }
    })
  }

  return prisma.companyNews.findMany({
    where: { symbol },
    orderBy: { datetime: 'desc' },
    take: 10
  })
}

// General market news — cache-first, 6hr TTL
const getMarketNews = async () => {
  const cached = await prisma.marketNews.findMany({
    where: { insertedAt: { gte: sixHoursAgo() } },
    orderBy: { datetime: 'desc' },
    take: 20
  })
  if (cached.length > 0) return cached

  const res = await fetch(`${FINNHUB_BASE}/news?category=general`, { headers })
  if (!res.ok) throw new Error(`Finnhub market news: ${res.status}`)
  const news = await res.json()

  for (const n of news.slice(0, 20)) {
    await prisma.marketNews.upsert({
      where: { newsId: n.id },
      update: {
        category: n.category, datetime: n.datetime, headline: n.headline,
        source: n.source, url: n.url, insertedAt: new Date()
      },
      create: {
        newsId: n.id, category: n.category, datetime: n.datetime,
        headline: n.headline, source: n.source, url: n.url
      }
    })
  }

  return prisma.marketNews.findMany({ orderBy: { datetime: 'desc' }, take: 20 })
}

// IPO calendar — cache-first, 24hr TTL — fetches next 30 days
const getIPO = async () => {
  const cached = await prisma.ipoCalendar.findMany({
    where: { insertedAt: { gte: twentyFourHrsAgo() } },
    orderBy: { date: 'asc' }
  })
  if (cached.length > 0) return cached

  const from = new Date().toISOString().split('T')[0]
  const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const res = await fetch(`${FINNHUB_BASE}/calendar/ipo?from=${from}&to=${to}`, { headers })
  if (!res.ok) throw new Error(`Finnhub IPO calendar: ${res.status}`)
  const data = await res.json()
  const ipos = data.ipoCalendar || []

  // IPO calendar has no stable unique key — wipe and re-insert on cache miss
  await prisma.ipoCalendar.deleteMany()
  if (ipos.length > 0) {
    await prisma.ipoCalendar.createMany({
      data: ipos.map((ipo) => ({
        symbol: ipo.symbol || null,
        name: ipo.name || null,
        date: ipo.date || null,
        price: ipo.price ? parseFloat(ipo.price) : null,
        shares: ipo.numberOfShares ? parseFloat(ipo.numberOfShares) : null,
        status: ipo.status || null
      }))
    })
  }

  return prisma.ipoCalendar.findMany({ orderBy: { date: 'asc' } })
}

module.exports = { getStockQuote, syncAllPrices, getCompanyProfile, getCompanyNews, getMarketNews, getIPO }
