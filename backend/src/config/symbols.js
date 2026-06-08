// Single source of truth — mirrors frontend tickers.ts
const STOCK_SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX', 'UBER', 'AMD']
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'DOGE', 'SOL', 'ADA', 'XRP']
const FOREX_PAIRS = [
  { from: 'GBP', to: 'USD' },
  { from: 'EUR', to: 'USD' }
]
const NEWS_SENTIMENT_SYMBOLS = [
  'AAPL',
  'TSLA',
  'MSFT',
  'GOOGL',
  'AMZN',
  'NVDA',
  'META',
  'NFLX',
  'UBER',
  'AMD',
  'COIN,CRYPTO:BTC',
  'COIN,CRYPTO:ETH',
  'COIN,CRYPTO:DOGE',
  'COIN,CRYPTO:SOL',
  'COIN,CRYPTO:ADA',
  'COIN,CRYPTO:XRP'
]

module.exports = { STOCK_SYMBOLS, CRYPTO_SYMBOLS, FOREX_PAIRS, NEWS_SENTIMENT_SYMBOLS }
 