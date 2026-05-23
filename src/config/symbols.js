// Single source of truth — mirrors frontend tickers.ts
const STOCK_SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX', 'UBER', 'AMD']
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'DOGE', 'SOL', 'ADA', 'XRP']
const FOREX_PAIRS = [
  { from: 'GBP', to: 'USD' },
  { from: 'EUR', to: 'USD' }
]

module.exports = { STOCK_SYMBOLS, CRYPTO_SYMBOLS, FOREX_PAIRS }
 