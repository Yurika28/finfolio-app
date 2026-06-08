

/** Base type for all ticker symbols */
export type TickerSymbol = string;

/** Alias for stock ticker symbols */
export type StockSymbol = TickerSymbol;

/** Alias for forex ticker symbols */
export type ForexSymbol = TickerSymbol;

/** Type for news ticker symbols (supports various asset types) */
export type NewsTickerSymbol = string;

// ============================================================================
// STOCK SYMBOLS
// ============================================================================

/** Popular stock symbols */
export const STOCK_SYMBOLS: StockSymbol[] = [
  // "AAPL", // Apple Inc.
  // "TSLA", // Tesla Inc.
  // "MSFT", // Microsoft Corporation
  // "NVDA", // NVIDIA Corporation
  // "AMZN", // Amazon.com Inc.
  // "PFE",  // Pfizer Inc.
  // "IBM",  // International Business Machines
  // "WMT",  // Walmart Inc.
  // "CVX",  // evron Corporation
  // "NFLX", // Netflix Inc.
  // "BTC",
  // "ETH",
  // "DOGE",
  "SOL",
  // "ADA",
  // "XRP",
];



/** Default forex currency symbols */
export const DEFAULT_FOREX_SYMBOLS: ForexSymbol[] = [
  "EUR", // Euro
  "SGD", // Singapore Dollar
];

// ============================================================================
// CRYPTO SYMBOLS
// ============================================================================

/** Structure for crypto symbols with supported markets */
export type CryptoSymbol = {
  symbol: string;
  markets: string[];
};

/** Default cryptocurrency symbols with their supported markets */
export const DEFAULT_CRYPTO_SYMBOLS: CryptoSymbol[] = [
  { symbol: "BTC", markets: ["USD", "EUR"] }, // Bitcoin
  { symbol: "ETH", markets: ["USD", "EUR"] }, // Ethereum
  { symbol: "DOGE", markets: ["USD", "EUR"] }, // Dogecoin
  { symbol: "SOL", markets: ["USD", "EUR"] },
  { symbol: "ADA", markets: ["USD", "EUR"] }, // Dogecoin
  { symbol: "XRP", markets: ["USD", "EUR"] },

];


export type NewsAssetType = "COIN" | "CRYPTO" | "FOREX";

/** Target configuration for news sentiment analysis */
export interface NewsSentimentTarget {
  type: NewsAssetType;
  symbol?: string;
}

/** Default news ticker symbols for various asset types */
export const DEFAULT_NEWS_TICKERS: NewsTickerSymbol[] = [        // Coinbase (equity)
  "CRYPTO:BTC",  // Bitcoin
  "CRYPTO:ETH",  // Ethereum
  "FOREX:USD",   // USD forex
  "FOREX:EUR",   // Euro forex
];

/** Default symbols for news sentiment analysis */
export const DEFAULT_NEWS_SENTIMENT_SYMBOLS: NewsSentimentTarget[] = [
  { type: "COIN" },
  { type: "CRYPTO", symbol: "BTC" },
  { type: "CRYPTO", symbol: "ETH" },
  { type: "FOREX", symbol: "USD" },
  { type: "FOREX", symbol: "EUR" },
];

// ============================================================================
// DEFAULT TICKER CONFIGURATION
// ============================================================================

/** Default ticker symbols used across the application */
export const DEFAULT_TICKER_SYMBOLS: TickerSymbol[] = [
  ...DEFAULT_FOREX_SYMBOLS,
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parses ticker symbols from URL search parameters
 * @param searchParams - URL search parameters object
 * @returns Array of ticker symbols, defaults to DEFAULT_TICKER_SYMBOLS if none provided
 */
export function parseSymbolsParam(searchParams: URLSearchParams): TickerSymbol[] {
  const symbolsParam = searchParams.get("symbols");
  return symbolsParam ? symbolsParam.split(",") : DEFAULT_TICKER_SYMBOLS;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default DEFAULT_TICKER_SYMBOLS;
