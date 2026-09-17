-- CreateTable
CREATE TABLE "anonymous_chat_sessions" (
    "id" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anonymous_chat_sessions_pkey" PRIMARY KEY ("id")
);
