'use client'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChat } from '@/hooks/useChat'

export default function HeroSection() {
  const { messages, isLoading: chatLoading, error: chatError, send } = useChat()
  const [chatInput, setChatInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  const handleChatSend = () => {
    if (!chatInput.trim() || chatLoading) return
    send(chatInput.trim())
    setChatInput('')
  }

  const handleChatKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSend()
    }
  }

  return (
    <section
      className="relative overflow-hidden bg-hero-bg bg-cover bg-center py-16 sm:py-20 lg:py-28"
      style={{ backgroundImage: "url('/hero-background.jpg')" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(10,13,12,0.55) 0%, rgba(10,13,12,0.7) 65%, var(--hero-bg) 100%)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 container mx-auto px-5 lg:px-8 flex flex-col lg:flex-row items-center gap-[18px] lg:gap-[88px]">

        {/* Copy column */}
        <div className="flex-1 text-left max-w-[720px]">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-hero-accent" aria-hidden="true" />
            <span className="font-eyebrow text-[11px] sm:text-[13px] font-medium uppercase tracking-[0.14em] text-hero-accent">
              AI-Powered Markets
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-semibold text-[44px] lg:text-[100px] leading-[0.96] tracking-[-0.025em]">
            <span className="block text-hero-text-primary">Your financial</span>
            <span className="block italic font-medium text-hero-accent">command center.</span>
          </h1>

          {/* Subhead */}
          <p className="font-body text-[15px] sm:text-[19px] leading-[1.6] text-hero-text-muted mt-5 max-w-[520px]">
            Real-time stocks, crypto and forex — plus AI analysis that actually explains what&apos;s moving, and why.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-[30px] mt-8">
            <Link
              href="/stocks"
              className="inline-flex items-center gap-2 rounded-md bg-hero-accent hover:bg-hero-accent-hover px-[30px] py-[17px] font-body font-semibold text-base text-hero-accent-on transition-colors"
            >
              Explore Markets
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="font-body text-[15px] font-medium text-hero-text-primary underline decoration-hero-text-primary/30 underline-offset-[5px] hover:decoration-hero-text-primary transition-colors"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* Mini Market Chat */}
        <div className="w-full lg:w-[420px] shrink-0">
          <Card className="!bg-hero-surface border-hero-border rounded-[10px] flex flex-col h-[420px] lg:h-[460px] p-0 gap-0">
            <div className="px-7 pt-[18px] pb-[14px] border-b border-hero-border flex items-center justify-between">
              <span className="font-body text-[13px] font-semibold uppercase tracking-[0.06em] text-hero-text-primary">
                Market Chat
              </span>
              <Link href="/chat" className="font-eyebrow text-xs font-medium text-hero-accent hover:text-hero-accent-hover transition-colors">
                Open full chat →
              </Link>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3">
              {messages.length === 0 && !chatLoading && (
                <p className="font-body italic text-sm text-hero-text-faint text-center mt-6">Ask anything about markets, stocks, or crypto</p>
              )}
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`font-body max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === 'user' ? 'bg-hero-accent text-hero-accent-on font-medium' : 'bg-hero-surface text-hero-text-primary'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-hero-surface rounded-xl px-3 py-2 space-y-1.5">
                      <Skeleton className="h-2.5 w-32 bg-hero-border" />
                      <Skeleton className="h-2.5 w-20 bg-hero-border" />
                    </div>
                  </div>
                )}
                {chatError && (
                  <div className="flex justify-start">
                    <div className="font-body max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed bg-red-950/60 text-red-300 border border-red-900">
                      {chatError}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>
            <div className="px-5 pb-5 pt-3 border-t border-hero-border flex gap-2">
              <label htmlFor="hero-chat-input" className="sr-only">
                Ask about markets
              </label>
              <Textarea
                id="hero-chat-input"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleChatKey}
                placeholder="Ask about markets…"
                rows={1}
                className="bg-hero-surface border-hero-border rounded-md text-hero-text-primary placeholder:text-hero-text-faint resize-none text-xs flex-1 font-body"
              />
              <Button
                onClick={handleChatSend}
                disabled={!chatInput.trim() || chatLoading}
                className="bg-hero-accent hover:bg-hero-accent-hover text-hero-accent-on font-body font-semibold text-xs px-3 shrink-0"
              >
                Send
              </Button>
            </div>
          </Card>
        </div>

      </div>

      {/* Bottom accent hairline */}
      <div
        className="absolute inset-x-0 bottom-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, transparent, var(--hero-accent), transparent)" }}
        aria-hidden="true"
      />
    </section>
  )
}
