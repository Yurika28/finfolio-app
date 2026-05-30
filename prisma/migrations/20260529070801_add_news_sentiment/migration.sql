-- CreateTable
CREATE TABLE "news_sentiment" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "bannerImage" TEXT,
    "source" TEXT,
    "sourceDomain" TEXT,
    "summary" TEXT,
    "overallSentimentLabel" TEXT,
    "overallSentimentScore" DOUBLE PRECISION,
    "sentimentLabel" TEXT,
    "sentimentScore" DOUBLE PRECISION,
    "relevanceScore" DOUBLE PRECISION,
    "publishedAt" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_sentiment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_sentiment_url_symbol_key" ON "news_sentiment"("url", "symbol");
