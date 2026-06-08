-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks_price" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "dp" DOUBLE PRECISION NOT NULL,
    "d" DOUBLE PRECISION NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stocks_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_chart" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "adjustedClose" DOUBLE PRECISION,
    "volume" BIGINT,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_currency_rate" (
    "id" SERIAL NOT NULL,
    "fromSymbol" TEXT NOT NULL,
    "toSymbol" TEXT NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "lastRefreshed" TEXT NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crypto_currency_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forex_price" (
    "id" SERIAL NOT NULL,
    "fromSymbol" TEXT NOT NULL,
    "toSymbol" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forex_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profile" (
    "id" SERIAL NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT,
    "exchange" TEXT,
    "finnhubIndustry" TEXT,
    "marketCapitalization" DOUBLE PRECISION,
    "logo" TEXT,
    "weburl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_news" (
    "id" SERIAL NOT NULL,
    "newsId" INTEGER NOT NULL,
    "category" TEXT,
    "datetime" INTEGER,
    "headline" TEXT,
    "source" TEXT,
    "url" TEXT,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_news" (
    "id" SERIAL NOT NULL,
    "newsId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "category" TEXT,
    "datetime" INTEGER,
    "headline" TEXT,
    "image" TEXT,
    "source" TEXT,
    "summary" TEXT,
    "url" TEXT,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ipo_calendar" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT,
    "name" TEXT,
    "date" TEXT,
    "price" DOUBLE PRECISION,
    "shares" DOUBLE PRECISION,
    "status" TEXT,
    "insertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ipo_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holdings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "buyPrice" DOUBLE PRECISION NOT NULL,
    "buyDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_price_symbol_key" ON "stocks_price"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_chart_symbol_date_key" ON "weekly_chart"("symbol", "date");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_currency_rate_fromSymbol_toSymbol_key" ON "crypto_currency_rate"("fromSymbol", "toSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "forex_price_fromSymbol_toSymbol_date_key" ON "forex_price"("fromSymbol", "toSymbol", "date");

-- CreateIndex
CREATE UNIQUE INDEX "company_profile_ticker_key" ON "company_profile"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "market_news_newsId_key" ON "market_news"("newsId");

-- CreateIndex
CREATE UNIQUE INDEX "company_news_newsId_symbol_key" ON "company_news"("newsId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "insights_type_key" ON "insights"("type");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_userId_symbol_key" ON "watchlist"("userId", "symbol");

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
